import { UnauthorizedError } from "../../types/error";
import { getInjection } from "../../types/di";
import { ProductUpdate } from "../../models/Product";
import { UserRoles } from "../../models/User";



export const updateProductUseCase = async (id: number, data: ProductUpdate) => {

    const authService = await getInjection("IAuthenticationService");

    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError("User does not have access to this resource");
    }

    user.validateRole([UserRoles.EDITOR, UserRoles.SUPER_ADMIN]);

    const productRepository = await getInjection("IProductRepository");

    await productRepository.updatePricesWithVAT(id, data.vatRate);

    await productRepository.update(id, data);

}