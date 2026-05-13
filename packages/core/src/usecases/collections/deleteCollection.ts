import { UserRoles } from "../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../types";

export const deleteCollectionUseCase = async (id: number): Promise<void> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const collectionRepository = await getInjection('ICollectionRepository');
    await collectionRepository.deleteCollectionProductsByCollectionId(id);
    await collectionRepository.deleteCollection(id);
};
