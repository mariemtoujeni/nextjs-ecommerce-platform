import { getInjection, UnauthorizedError } from "../../types";
import { UserRoles } from "../../models";

export const getProductAdmin = async (productId: number, modelId?: number) => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError("Unauthorized access to resources for user");
    }

    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    if(!modelId) {
        const productRepository = await getInjection("IProductRepository");
        const product = await productRepository.readAdmin(productId);
        return product;
    }

    const productRepository = await getInjection("IProductRepository");
    const product = await productRepository.readAdminByModelId(modelId);
    return product;
}