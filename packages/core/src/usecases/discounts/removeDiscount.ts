import { ErrorCodes, UnauthorizedError } from "../../types";
import { getInjection } from "../../types/di";
import { UserRoles } from "../../models";

export const deleteDiscountUseCase = async (id: number): Promise<void> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    const discountRepository = await getInjection('IDiscountRepository');

    await discountRepository.deleteDiscount(id);

}