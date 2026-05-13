import { Stock, UserRoles } from "../../models";
import { ErrorCodes, ReturnAll, UnauthorizedError, getInjection } from "../../types";

export const listStockByModelIdsUseCase = async (modelIds: number[]): Promise<Stock[]> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const stockRepository = await getInjection('IStockRepository');
    const stocks = await stockRepository.listStockByModelIds(modelIds);
    return stocks;
}