import { Department, ModelAttributValue, ModelWithProduct, 
    shopInputSchema, ShopLine, ShopLineInput, shopLineInputSchema, 
    ShopPresenterInput, ShopStatus, UserRoles } from "../../../models";
import { getInjection, ReturnAll, ReturnOne } from "../../../types";
import { ShopPresenterWithModels } from "./openShop";
import { BadRequestError, ErrorCodes, UnauthorizedError } from "../../../types/error";
import { listAllProductModelsByIdArrayUseCase } from "../../product-models";

export const createShopLine = async (shopLines: ShopLineInput[]) : Promise<ShopLine[]> => {
    for (let i = 0; i < shopLines.length; i++) {
        const validatedShopLine = shopLineInputSchema.safeParse(shopLines[i]);
        if (!validatedShopLine.success) {
            throw new BadRequestError(`Shop line ${i + 1}: ${validatedShopLine.error.message}`);
        }
    }

    const stockRepository = await getInjection('IStockRepository');
    const stocks = await stockRepository.readStockByIds(shopLines.map((line) => line.idModel));
    if(stocks.error) {
        throw new BadRequestError(stocks.error);
    }
    if(stocks.items.length !== shopLines.length) {
        throw new BadRequestError("Stocks not found");
    }

    const modelRepository = await getInjection('IModelRepository');
    const models = await modelRepository.readModelsByIds(shopLines.map((line) => line.idModel));
    if(models.length !== shopLines.length) {
        throw new BadRequestError("Models not found");
    }

    shopLines.forEach((line, index) => {
        const model = models.find((model) => model.id === line.idModel);
        const stock = stocks.items.find((stock) => stock.idModel === line.idModel);
        const remainingStock = (stock?.disponible ?? 0) - (line.initialQuantity ?? 0);
        if(remainingStock < (model?.minStock ?? 0)) {
            throw new BadRequestError(`Stock is less than minimum stock for model ${line.idModel}`);
        }
    });

    const shopRepository = await getInjection('IShopRepository');
    const shopLinesCreated = await shopRepository.createShopLine(shopLines);
    return shopLinesCreated;
}

export const duplicateShopUseCase = async (shop: ShopPresenterInput) : Promise<ReturnOne<ShopPresenterWithModels>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const shopToCreate = {
        name: shop.name,
        isActive: false,
        status: ShopStatus.DRAFT,
        department: shop.department as Department,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    const validatedShop = shopInputSchema.safeParse(shopToCreate);
    if (!validatedShop.success) {
        throw new BadRequestError(validatedShop.error.message);
    }

    const shopRepository = await getInjection('IShopRepository');
    const createdShop = await shopRepository.createShop(validatedShop.data);
    const shopLinesToCreate : ShopLine[] = shop.lines.map((l : ShopLine) => {
        return {
            idShop: createdShop.id,
            idModel: l.idModel,
            initialQuantity: l.finalQuantity,
            soldQuantity: 0,
            finalQuantity: 0,
            totalPriceTTC: 0
        }
    });

    const createdShopLines : ShopLine[] = await createShopLine(shopLinesToCreate);
    const modelIds = createdShopLines.map((l : ShopLine) => l.idModel) || [];
    const models : ReturnAll<ModelWithProduct> = await listAllProductModelsByIdArrayUseCase(modelIds);

    const shopPresenterWithModels : ShopPresenterWithModels = {
        id: createdShop.id,
        name: createdShop.name,
        department: createdShop.department,
        status: createdShop.status,
        expirationDate: createdShop.expirationDate,
        isActive: createdShop.isActive,
        createdAt: createdShop.createdAt,
        lines: createdShopLines.map((l : ShopLine) => {
            return {
                idModel: l.idModel,
                idShop: l.idShop,
                initialQuantity: l.initialQuantity,
                soldQuantity: l.soldQuantity,
                finalQuantity: l.finalQuantity,
                totalPriceTTC: l.totalPriceTTC,
                model: {
                    name: models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.product.descriptions[0]?.title ?? '',
                    attributs: models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.attributValues.map((a : ModelAttributValue) => a.attributValue.nom) ?? [],
                    price: (models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.priceWithVat ?? 0) > 0 ? 
                            (models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.priceWithVat ?? 0) :                             
                            (models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.product.price ?? 0),
                    image: models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.product.images[0]?.url ?? ''
                }
            }
        })
    }

    return {
        item: shopPresenterWithModels
    } as ReturnOne<ShopPresenterWithModels>;
}