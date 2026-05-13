import { getInjection } from "../../types/di";
import { ProductDescriptionUpdate } from "../../models/Product";
import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { UserRoles } from "../../models/User";

export const updateDescriptionUseCase = async (id: number, data: ProductDescriptionUpdate) => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    
    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }

    user.validateRole([UserRoles.EDITOR, UserRoles.SUPER_ADMIN]);

    
    const productRepository = await getInjection("IProductRepository");
    await productRepository.updateDescription(id, data);
}