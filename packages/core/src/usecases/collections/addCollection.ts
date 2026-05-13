import { Collection, CollectionInput, UserRoles } from "../../models";
import { ErrorCodes, getInjection, UnauthorizedError } from "../../types";
import { InternalServerError } from "../../types";

export const addCollectionUseCase = async (collection: CollectionInput): Promise<Collection> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const collectionRepository = await getInjection('ICollectionRepository');
    const existingCollection = await collectionRepository.readAllCollections();
    // Check if the name is empty
    if (!collection.name) {
        throw new InternalServerError("Name is required");
    }
    // Check if the collection already exists
    if (existingCollection.find(c => c.name === collection.name)) {
        throw new InternalServerError("Collection already exists");
    }
    const newCollection = await collectionRepository.createCollection(collection);
    return newCollection;
};
