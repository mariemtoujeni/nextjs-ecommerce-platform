import { StockFilterInput, StockOptionsSchema, StockPresenter, UserRoles } from "../../models";
import { BadRequestError, ErrorCodes, ReturnAll, UnauthorizedError, getInjection } from "../../types";

export const listStocksUseCase = async (options?: StockFilterInput): Promise<ReturnAll<StockPresenter>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const validatedOptions = StockOptionsSchema.safeParse(options || {});

    if (!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }
    
    const stockRepository = await getInjection('IStockRepository');
    const stocks = await stockRepository.listStocks(validatedOptions.data);
    return stocks;
}