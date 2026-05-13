import { getInjection } from "../../types/di";
import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { UserRoles } from "../../models";

export const deleteCustomization = async (customizationId: number): Promise<void> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const productCustomizationRepository = await getInjection("IProductCustomizationRepository");
    await productCustomizationRepository.delete(customizationId);
}