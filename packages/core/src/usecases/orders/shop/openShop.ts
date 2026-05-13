import { Department, Shop, ShopInput, shopInputSchema, ShopLine, 
    shopLineInputSchema, ShopLineWithModel, ShopStatus, UserRoles } from "../../../models";
import { getInjection, ReturnOne } from "../../../types";
import { BadRequestError, ErrorCodes, UnauthorizedError } from "../../../types/error"

export type ShopPresenterWithModels = Shop & {
    lines: ShopLineWithModel[];
}

const updateShopLine = async (shopLines: ShopLine[]) : Promise<ShopLine[]> => {
    // Validate each shop line individually
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
    const shopLineUpdated = await shopRepository.updateShopLine(shopLines);
    return shopLineUpdated;
}

const updateShop = async (id: number, shop: ShopInput) : Promise<Shop> => {
    const validatedShop = shopInputSchema.safeParse(shop);
    if (!validatedShop.success) {
        throw new BadRequestError(validatedShop.error.message);
    }

    const shopRepository = await getInjection('IShopRepository');
    const shopUpdated = await shopRepository.updateShop(id, shop);
    return shopUpdated;
}

export const openShopUseCase = async (shop: ShopPresenterWithModels) : Promise<ReturnOne<Shop>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const shopRepository = await getInjection('IShopRepository');
    const shopToOpen = await shopRepository.readShopById(shop.id);
    if(!shopToOpen) {
        throw new BadRequestError("Shop not found");
    }

    if(shopToOpen.status === ShopStatus.CLOSED || shopToOpen.status === ShopStatus.FINALISED) {
        throw new BadRequestError("Impossible d'ouvrir un point de vente fermé ou finalisé");
    }

    const shopLines = shop.lines;
    if(shopLines && shopLines.length > 0) {
        const shopLinesToUpdate : ShopLine[] = [];
        for(const line of shopLines) {
            if(line.initialQuantity <= 0)   {
                throw new BadRequestError(`Le model ${line.idModel} a une quantité initiale inférieure ou égale 0`);
            }
            shopLinesToUpdate.push({
                ...line,
                idShop: shop.id
            });
        }
        await updateShopLine(shopLinesToUpdate);
    }

    const createdShop = await updateShop(shop.id, {
        ...shopToOpen,
        status: ShopStatus.OPEN,
        isActive: true,
        department: shopToOpen.department as Department,
        updatedAt: new Date().toISOString(),
        expirationDate: undefined,
        createdAt: (typeof shopToOpen.createdAt === 'string') ? shopToOpen.createdAt : shopToOpen.createdAt.toISOString()
    });

    return {
        item: createdShop
    }
}