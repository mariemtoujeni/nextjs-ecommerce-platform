import { ErrorCodes, UnauthorizedError } from "../../types";
import { DiscountLine, UserRoles } from "../../models";
import { getInjection } from "../../types/di";

export const updateDiscountLineUseCase = async (discountLine: Partial<DiscountLine> & { id: number }): Promise<DiscountLine> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    const discountLineRepository = await getInjection('IDiscountRepository');
    const oldDiscountLine = await discountLineRepository.readDiscountLineById(discountLine.id)
    const updatedDiscountLine = await discountLineRepository.updateDiscountLine({
        ...oldDiscountLine,
        ...discountLine,
    });


    return updatedDiscountLine;
}