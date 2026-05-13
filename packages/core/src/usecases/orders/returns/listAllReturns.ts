import { BadRequestError, ErrorCodes, getInjection, ReturnAll, UnauthorizedError } from "../../../types";
import { ReturnPresenter, ReturnFilterInput, returnOptionsSchema } from "../../../models";
import { UserRoles } from "../../../models";

export const listAllReturnsUseCase = async (options?: ReturnFilterInput): Promise<ReturnAll<ReturnPresenter>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const validatedOptions = returnOptionsSchema.safeParse(options || {});
    if (!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const returnRepository = await getInjection("IReturnRepository");
    const returns = await returnRepository.listAllReturns(validatedOptions.data);

    return returns;
};