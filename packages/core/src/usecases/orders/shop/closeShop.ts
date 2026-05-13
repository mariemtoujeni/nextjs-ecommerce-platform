import { ErrorCodes, getInjection, ReturnOne } from "../../../types";
import { CheckoutStatus, Department, PaymentMode, PurchaseOrderStatus, Shop, shopLineInputSchema, ShopPresenter, ShopStatus, StockInputSchema, UserRoles } from "../../../models";
import { BadRequestError, UnauthorizedError } from "../../../types/error";

export const closeShopUseCase = async (shopToClose: ShopPresenter) : Promise<ReturnOne<Shop>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    if(!shopToClose) {
        throw new BadRequestError("Shop not found");
    }

    // Validation des stocks finaux
    const shopLines = shopToClose.lines;
    if(shopLines && shopLines.length > 0) {
        const invalidLine = shopLines.find(line => {
            const stockFinal = line.initialQuantity - line.soldQuantity;
            return stockFinal < 0;
        });
        
        if(invalidLine) {
            throw new BadRequestError(`Stock final is negative for model ${invalidLine.idModel}`);
        }
    }

    // Récupération des checkouts et mise à jour en parallèle
    const checkoutRepository = await getInjection('ICheckoutRepository');
    const relatedCheckouts = await checkoutRepository.readCheckoutsByShopId(shopToClose.id);
    if(relatedCheckouts.error) {
        throw new BadRequestError(relatedCheckouts.error);
    }

    // Mise à jour des checkouts en parallèle
    const checkoutUpdates = relatedCheckouts.items.map(checkout => 
        checkoutRepository.updateCheckout(checkout.id, {
            idClient: checkout.idClient,
            idShop: checkout.idShop,
            paymentMethod: checkout.paymentMethod,
            totalHT: checkout.totalHT,
            totalTTC: checkout.totalTTC,
            status: CheckoutStatus.CLOSED,
        })
    );
    await Promise.all(checkoutUpdates);

    // Préparation des lignes de shop à mettre à jour
    const shopLinesToUpdate = shopToClose.lines?.map((line) => ({
        idModel: line.idModel,
        idShop: line.idShop,
        initialQuantity: line.initialQuantity,
        soldQuantity: line.soldQuantity,
        finalQuantity: line.finalQuantity,
        totalPriceTTC: line.totalPriceTTC
    })) ?? [];

    // Mise à jour des lignes de shop
    // Validate each shop line individually
    for (let i = 0; i < shopLinesToUpdate.length; i++) {
        const validatedShopLine = shopLineInputSchema.safeParse(shopLinesToUpdate[i]);
        if (!validatedShopLine.success) {
            throw new BadRequestError(`Shop line ${i + 1}: ${validatedShopLine.error.message}`);
        }
    }

    const shopRepository = await getInjection('IShopRepository');
    const shopLineUpdated = await shopRepository.updateShopLine(shopLinesToUpdate);

    // Création d'une Map pour optimiser les recherches O(1)
    const soldQuantityMap = new Map(
        shopLinesToUpdate.map(line => [line.idModel, line.soldQuantity])
    );

    // Récupération des stocks
    const modelIds = shopLinesToUpdate.map((line) => line.idModel);
    const stockRepository = await getInjection('IStockRepository');
    const stocks = await stockRepository.readStockByIds(modelIds);
    if(stocks.error) {
        throw new BadRequestError(stocks.error);
    }

    // Récupération des modeles 
    const modelRepository = await getInjection('IModelRepository');
    const models = await modelRepository.readModelsByIds(modelIds);
    if(models.length !== modelIds.length) {
        throw new BadRequestError("Models not found");
    }

    // Calcul des stocks mis à jour
    const updatedStocks = stocks.items?.map((stock) => {
        const soldQuantity = soldQuantityMap.get(stock.idModel) || 0;
        const model = models.find(model => model.id === stock.idModel);
        if(!model) {
            throw new BadRequestError("Model not found");
        }
        const newDisponible = stock.disponible - soldQuantity;        
        const stockToCommand = newDisponible < 0 && stock.disponible <= 0 ? soldQuantity 
            : newDisponible < 0 ? Math.abs(newDisponible) : 0;
        
        return {
            idModel: stock.idModel,
            locked: stock.locked,
            indisponible: stock.indisponible, //newDisponible > 0 ? 0 : stock.indisponible + stockToCommand,
            disponible: newDisponible > model.minStock ? newDisponible : model.minStock,
            updatedAt: new Date().toISOString(),
            stockToCommand: stockToCommand
        }
    }) || [];

    // Récupération de tous les produits en une seule fois pour éviter les appels multiples
    const productsToFetch = updatedStocks
        .filter(stock => stock.stockToCommand > 0)
        .map(stock => stock.idModel);
    
    const productsMap = new Map();
    const productRepository = await getInjection("IProductRepository");
    if (productsToFetch.length > 0) {
        const productsPromises = productsToFetch.map(async (modelId) => {
            return productRepository.readAdminByModelId(modelId).then(product => ({ modelId, product }));
        });
        const products = await Promise.all(productsPromises);
        products.forEach(({ modelId, product }) => {
            productsMap.set(modelId, product);
        });
    }

    // Traitement des commandes fournisseurs en parallèle
    const purchaseOrderRepository = await getInjection('IPurchaseOrderRepository');
    const purchaseOrderPromises = updatedStocks
    .filter(stock => stock.stockToCommand > 0)
    .map(async (stock) => {
        const stockLinesByModelId = await purchaseOrderRepository.readPurchaseOrderLine({modelId: stock.idModel});
        let purchaseOrderLine = undefined;

        if(Array.isArray(stockLinesByModelId)) {
            purchaseOrderLine = stockLinesByModelId[0];
        } else {
            purchaseOrderLine = stockLinesByModelId;
        }

        if(purchaseOrderLine) {
            const updatedPurchaseOrderLine = await purchaseOrderRepository.updatePurchaseOrderLine({
                id: purchaseOrderLine.id,
                orderSupplierId: purchaseOrderLine.orderSupplierId,
                modelId: purchaseOrderLine.modelId,
                quantity: purchaseOrderLine.quantity + stock.stockToCommand
            });
            return updatedPurchaseOrderLine;
        } else {
            const product = productsMap.get(stock.idModel);
            if (!product) {
                throw new Error(`Product not found for model ${stock.idModel}`);
            }

            const createdPurchaseOrder = await purchaseOrderRepository.createPurchaseOrderPresenter({
                supplierId: product.supplierId,
                paymentMode: PaymentMode.CHEQUE,
                status: PurchaseOrderStatus.BROUILLON,
                createdAt: new Date(),
                valid: false,
                lines: [
                    {
                        orderSupplierId: 1,
                        modelId: stock.idModel,
                        quantity: stock.stockToCommand,
                        valid: false,
                        receivedQuantity: 0
                    }
                ]
            });
            return createdPurchaseOrder;
        }
    });
    await Promise.all(purchaseOrderPromises);

    // Mise à jour des stocks
    const stocksToUpdate = updatedStocks.map((stock) => ({
        idModel: stock.idModel,
        locked: stock.locked,
        indisponible: stock.indisponible,
        disponible: stock.disponible,
        updatedAt: new Date().toISOString()
    }));

    stocksToUpdate.forEach(stock => {
        const validatedStock = StockInputSchema.safeParse(stock);
        if (!validatedStock.success) {
            throw new BadRequestError(validatedStock.error.message);
        }
    });

    await stockRepository.updateStock(stocksToUpdate);

    // Mise à jour finale du shop
    const shopToCloseToUpdate = {
        ...shopToClose,
        status: ShopStatus.CLOSED,
        expirationDate: new Date().toISOString(),
        isActive: false,
        department: shopToClose.department as Department,
        createdAt: new Date(shopToClose.createdAt).toISOString()
    }

    const shop = await shopRepository.updateShop(shopToClose.id, shopToCloseToUpdate);
    return {
        item: shop,
        error: undefined,
    } as ReturnOne<Shop>;
}