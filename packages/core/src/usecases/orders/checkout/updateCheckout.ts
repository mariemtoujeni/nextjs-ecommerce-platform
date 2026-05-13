import { Checkout, CheckoutInput, UserRoles } from "../../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../../types";

export const updateCheckoutUseCase = async (id: number, checkout: CheckoutInput) : Promise<Checkout> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const checkoutRepository = await getInjection('ICheckoutRepository');
    const checkoutUpdated = await checkoutRepository.updateCheckout(id, checkout);
    return checkoutUpdated;
}