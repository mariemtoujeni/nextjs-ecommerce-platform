import { UserRoles } from "../../models/User";
import { UnauthorizedError } from "../../types/error";
import { getInjection } from "../../types/di";

export const updateCollections = async (id: number, update: number[]) => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError("User not authenticated");
    }

    user.validateRole([UserRoles.EDITOR, UserRoles.SUPER_ADMIN])

    const collectionRepository = await getInjection("ICollectionRepository");
    const collections = await collectionRepository.readCollectionProductsByProductId(id);
    
    const collectionsToAdd = update.filter(collection => !collections.some(c => c.collectionId === collection));
    const collectionsToRemove = collections.filter(collection => !update.some(c => c === collection.collectionId)).map(c => c.collectionId);

    for(const c of collectionsToAdd) {
        await collectionRepository.createCollectionProduct({
            collectionId: c,
            productId: id
        });
    }

    for(const c of collectionsToRemove) {
        await collectionRepository.deleteCollectionProduct(id, c);
    }
}