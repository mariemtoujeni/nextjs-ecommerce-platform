import { Checkout, CheckoutFilterInput, UserRoles } from "../../../models";
import { ErrorCodes, ReturnAll, UnauthorizedError, getInjection } from "../../../types";

export const listCheckoutsByIdShopUseCase = async (shopId: number, options?: CheckoutFilterInput) : Promise<ReturnAll<Checkout>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const checkoutRepository = await getInjection('ICheckoutRepository');
    const checkouts = await checkoutRepository.readCheckoutsByShopId(shopId);
    return checkouts;
}