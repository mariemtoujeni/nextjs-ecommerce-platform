import { Collection, CollectionProduct, UserRoles } from "../../models";
import { ErrorCodes, getInjection, ReturnAll, UnauthorizedError } from "../../types";


export interface CollectionDetail {
    general: Collection;
    products: ReturnAll<CollectionProduct>;
}


export const getCollectionByIdUseCase = async (id: number): Promise<CollectionDetail> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const collectionRepository = await getInjection('ICollectionRepository');
    const collection = await collectionRepository.readCollection(id);

    const collectionProducts = await collectionRepository.readCollectionProductsByCollectionId(id);
    

    return {
        general: collection,
        products: {
            items: collectionProducts,
            total: collectionProducts.length,
            count: collectionProducts.length,
        },
    };
};