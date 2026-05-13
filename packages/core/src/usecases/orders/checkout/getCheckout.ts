import { UserRoles } from "../../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../../types";

export const getCheckoutUseCase = async (id: number) => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const checkoutRepository = await getInjection('ICheckoutRepository');
    const checkout = await checkoutRepository.readCheckoutById(id);
    return checkout;
}