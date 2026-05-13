import { DiscountLine, DiscountLineInput, DiscountTypeProduct, DiscountTypeValue, UserRoles } from "../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../types";

export const addDiscountLineUseCase = async (discountLine: DiscountLineInput): Promise<DiscountLine> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const discountRepository = await getInjection('IDiscountRepository');

    const createdDiscountLine = await discountRepository.addDiscountLine(discountLine);
    return createdDiscountLine;
}