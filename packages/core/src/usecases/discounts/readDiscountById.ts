import { Discount, UserRoles } from "../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../types";

export const getDiscountByIdUseCase = async (id: number): Promise<Discount> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    const discountRepository = await getInjection('IDiscountRepository');
    const discount = await discountRepository.readDiscountById(id);

    return discount;
}