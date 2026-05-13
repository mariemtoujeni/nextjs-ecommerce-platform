import { Collection, CollectionInput, CollectionProduct } from "../models"; 
import { ReturnAll } from "../types";

export interface ICollectionRepository {
    readCollection(id: number) : Promise<Collection>;
    readAllCollections() : Promise<Collection[]>;
    createCollection(collection : CollectionInput) : Promise<Collection>;
    updateCollection(collection : Collection) : Promise<Collection>;
    deleteCollection(id: number) : Promise<void>;
    
    readAllCollectionProducts() : Promise<CollectionProduct[]>;
    createCollectionProduct(collectionProduct : CollectionProduct) : Promise<CollectionProduct>;
    updateCollectionProduct(collectionProduct : CollectionProduct) : Promise<CollectionProduct>;
    deleteCollectionProduct(productId: number, collectionId: number) : Promise<void>;
    deleteCollectionProductsByCollectionId(collectionId: number) : Promise<void>;

    readCollectionProductsByCollectionId(collectionId: number) : Promise<CollectionProduct[]>;
    readCollectionProductsByProductId(productId: number) : Promise<CollectionProduct[]>;

    readCollectionProductsByCollectionIdAndProductId(collectionId: number, productId: number) : Promise<CollectionProduct>;
    readPublishedProductByCollectionId(collectionId: number) : Promise<CollectionProduct[]>;
}