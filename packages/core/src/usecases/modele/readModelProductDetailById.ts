import { ModelProductDetail, UserRoles } from "../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../types";

export const readModelProductDetailByIdUseCase = async (modeleId: number): Promise<ModelProductDetail> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const modelRepository = await getInjection('IModelRepository');
    const modelProductDetail = await modelRepository.readModelProductDetailById(modeleId);

    return modelProductDetail;
}