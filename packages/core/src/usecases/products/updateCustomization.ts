import { Customization } from "../../models/Product";
import { getInjection } from "../../types/di";
import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { UserRoles } from "../../models";

export const updateCustomization = async (id: number, customization: Omit<Customization, "id">): Promise<void> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const productCustomizationRepository = await getInjection("IProductCustomizationRepository");
    await productCustomizationRepository.update(id, customization);
}