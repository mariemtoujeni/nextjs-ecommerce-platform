import { Collection, CollectionInput, CollectionProduct, UserRoles } from "../../models";
import { ErrorCodes, getInjection, NotFoundError, UnauthorizedError } from "../../types";
import { InternalServerError } from "../../types";
import { CollectionDetail } from "./getCollectionById";

export interface UpdateCollectionDetail {
    general: Collection;
    products: CollectionProduct[];
}

export const updateCollectionUseCase = async (id: number, collection: UpdateCollectionDetail): Promise<CollectionDetail> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const collectionRepository = await getInjection('ICollectionRepository');

    const collectionToUpdate = await collectionRepository.readCollection(id);
    if (!collectionToUpdate) {
        throw new NotFoundError(`Collection with ID ${id} not found`);
    }

    const updatedCollection = await collectionRepository.updateCollection(collection.general);
    const products = await collectionRepository.readCollectionProductsByCollectionId(id);
    
    const productToCreate = collection.products.filter(product => !products.some(p => p.productId === product.productId));
    for (const product of productToCreate) {
        // // check if product exists
        // const productToCheck = await collectionRepository.readProduct(product.productId);
        // if (!productToCheck) {
        //     throw new NotFoundError(`Product with ID ${product.productId} not found`);
        // }

        await collectionRepository.createCollectionProduct({
            collectionId: id,
            productId: product.productId,
            product: product.product,
            createdAt: new Date()
        });
    }

    const productToDelete = products.filter(product => !collection.products.some(p => p.productId === product.productId));
    for (const product of productToDelete) {
        await collectionRepository.deleteCollectionProduct(product.productId, id);
    }

    const productAfterUpdate = await collectionRepository.readCollectionProductsByCollectionId(id);

    const collectionDetail : CollectionDetail = {
        general: updatedCollection,
        products: {
            items: productAfterUpdate,
            total: productAfterUpdate.length,
            count: productAfterUpdate.length
        }
    };
    return collectionDetail;
}