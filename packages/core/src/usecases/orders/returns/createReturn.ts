import { ReturnPresenter, ReturnPresenterInput, UserRoles } from "../../../models";
import { ErrorCodes, getInjection, ReturnOne, UnauthorizedError } from "../../../types";

export const createReturnUseCase = async (returnData: ReturnPresenterInput) : Promise<ReturnOne<ReturnPresenter>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const returnRepository = await getInjection("IReturnRepository");
    const returnOne = await returnRepository.createReturn(returnData);
    return returnOne;
}