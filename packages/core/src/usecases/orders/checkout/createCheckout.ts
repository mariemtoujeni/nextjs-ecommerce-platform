import { Checkout, CreateCheckoutRequest, UserRoles } from "../../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../../types";

export const createCheckoutUseCase = async (checkout: CreateCheckoutRequest): Promise<Checkout> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const checkoutRepository = await getInjection('ICheckoutRepository');
    const newCheckout = await checkoutRepository.createCheckout(checkout);
    
    return newCheckout;
}