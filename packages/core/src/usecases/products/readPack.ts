import { Model, ProductPack, UserRoles } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const readPackUseCase = async (id: number): Promise<ProductPack[]> => {
    const authService = await getInjection("IAuthenticationService")
    const user = await authService.getUser()

    if(!user) {
        throw new UnauthorizedError("User not found");
    }

    const productRepository = await getInjection("IProductRepository");
    return productRepository.getPack(id);
}