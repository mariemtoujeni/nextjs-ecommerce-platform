import { BadRequestError, ErrorCodes, getInjection, UnauthorizedError } from "../../../types";
import { ShopLine, ShopLineInput, shopLineInputSchema, UserRoles } from "../../../models";

export const createShopLineUseCase = async (shopLines: ShopLineInput[]) : Promise<ShopLine[]> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
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
