import { Stock, UserRoles } from "../../models";
import { ErrorCodes, NotFoundError, ReturnOne, UnauthorizedError, getInjection } from "../../types";

export const getStockByIdUseCase = async (id: number): Promise<ReturnOne<Stock>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const stockRepository = await getInjection('IStockRepository');    
    const stock = await stockRepository.readStockById(id);
    return {
        item: stock,
        error: undefined
    };
}