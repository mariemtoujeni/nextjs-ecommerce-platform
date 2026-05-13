
import { getInjection } from "../../types/di";
import { Customization } from "../../models/Product";
import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { UserRoles } from "../../models";

export const addCustomization = async (productId: number, customization: Omit<Customization, "id">): Promise<Customization> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    const productCustomizationRepository = await getInjection("IProductCustomizationRepository");

    return await productCustomizationRepository.create(productId, customization);
}