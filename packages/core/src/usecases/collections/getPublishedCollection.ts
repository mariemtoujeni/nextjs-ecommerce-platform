import { Collection, CollectionProduct, ProductStatus } from "../../models";
import { getInjection, ReturnAll } from "../../types";

export interface Collections {
    general: Collection;
    products: ReturnAll<CollectionProduct>;
}
export const getPublishedCollectionUseCase = async (id: number): Promise<Collections> => {
    const collectionRepository = await getInjection('ICollectionRepository');
    const collection = await collectionRepository.readCollection(id);
    const collectionProducts = await collectionRepository.readPublishedProductByCollectionId(id);
   

    return {
        general: collection,
        products: {
            items: collectionProducts,
            total: collectionProducts.length,
            count: collectionProducts.length,
        },
    };
    
}