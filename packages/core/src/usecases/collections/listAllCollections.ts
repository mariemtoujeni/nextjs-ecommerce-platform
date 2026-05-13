import { Collection, UserRoles } from "../../models";
import { ErrorCodes, ReturnAll, UnauthorizedError, getInjection } from "../../types";

export const listAllCollectionsUseCase = async (): Promise<ReturnAll<Collection>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const collectionRepository = await getInjection('ICollectionRepository');

    const collections = await collectionRepository.readAllCollections();
    return {
        items: collections,
        total: collections.length,
        count: collections.length,
    };
}