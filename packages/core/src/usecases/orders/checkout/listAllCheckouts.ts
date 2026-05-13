import { CheckoutFilterInput, CheckoutPresenter, UserRoles } from "../../../models";
import { ErrorCodes, ReturnAll, UnauthorizedError, getInjection } from "../../../types";

export const listAllCheckoutsUseCase = async (options?: CheckoutFilterInput): Promise<ReturnAll<CheckoutPresenter>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const checkoutRepository = await getInjection('ICheckoutRepository');

    const checkouts = await checkoutRepository.readCheckoutsShopsUsers(options);
    
    return checkouts;
}
