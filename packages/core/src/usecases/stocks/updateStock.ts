import { Stock, StockInputSchema, UserRoles } from "../../models";
import { BadRequestError, ErrorCodes, getInjection, UnauthorizedError } from "../../types";

export const updateStockUseCase = async (stocks: Stock[]): Promise<void> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    stocks.forEach(stock => {
        const validatedStock = StockInputSchema.safeParse(stock);
        if (!validatedStock.success) {
            throw new BadRequestError(validatedStock.error.message);
        }
    });
    const stockRepository = await getInjection('IStockRepository');
    await stockRepository.updateStock(stocks);
}