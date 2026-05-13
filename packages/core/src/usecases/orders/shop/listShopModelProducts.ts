import { ModelFilterInput, modelOptionsSchema, ModelWithProduct, UserRoles } from "../../../models";
import { BadRequestError, ErrorCodes, getInjection, ReturnAll, UnauthorizedError } from "../../../types";

export const listShopModelProductsUseCase = async (shopId: number, options?: ModelFilterInput): Promise<ReturnAll<ModelWithProduct>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const validatedOptions = modelOptionsSchema.safeParse(options || {});
    if (!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const modelRepository = await getInjection('IModelRepository');
    const models = await modelRepository.readModelsWithProductByShopId(shopId, validatedOptions.data);

    return models;
}