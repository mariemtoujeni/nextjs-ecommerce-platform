import { ICollectionRepository } from "../../repositories";
import { Collection, CollectionInput, CollectionProduct, ProductStatus } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { NotFoundError } from "../../types/error";

export class MockCollectionRepository implements ICollectionRepository {


    // Collection Methods
    async readCollection(id: number): Promise<Collection> {
        const collection = SharedMemory.collections.find(collection => collection.id === id);
        if (!collection) {
            throw new NotFoundError(`Collection with ID ${id} not found`);
        }
        return collection;
    }

    async readAllCollections(): Promise<Collection[]> {
        return SharedMemory.collections;
    }

    async createCollection(collection: CollectionInput): Promise<Collection> {
        const newCollection = { ...collection, active: collection.active ? 1 : 0, id: SharedMemory.collections.length + 1 };
        SharedMemory.collections.push(newCollection);
        return newCollection;
    }

    async updateCollection(collection: Collection): Promise<Collection> {
        const index = SharedMemory.collections.findIndex(collection => collection.id === collection.id);
        if (index !== -1) {
            SharedMemory.collections[index] = { ...collection };
            return SharedMemory.collections[index];
        }
        throw new NotFoundError(`Collection with ID ${collection.id} not found`);
    }

    async deleteCollection(id: number): Promise<void> {
        const index = SharedMemory.collections.findIndex(collection => collection.id === id);
        if (index !== -1) {
            SharedMemory.collections.splice(index, 1);
        } else {
            throw new NotFoundError(`Collection with ID ${id} not found`);
        }
    }

    // Collection Product Methods
    async readAllCollectionProducts(): Promise<CollectionProduct[]> {
        return SharedMemory.collection_products;
    }

    async createCollectionProduct(collectionProduct: CollectionProduct): Promise<CollectionProduct> {
        const newCollectionProduct = { ...collectionProduct, id: Date.now() };
        SharedMemory.collection_products.push(newCollectionProduct);
        return newCollectionProduct;
    }

    async updateCollectionProduct(collectionProduct: CollectionProduct): Promise<CollectionProduct> {
        const index = SharedMemory.collection_products.findIndex(collectionProduct => collectionProduct.productId === collectionProduct.productId && collectionProduct.collectionId === collectionProduct.collectionId);
        if (index !== -1) {
            SharedMemory.collection_products[index] = { ...collectionProduct };
            return SharedMemory.collection_products[index];
        }
        throw new NotFoundError(`Collection Product with ID ${collectionProduct.productId} and Collection ID ${collectionProduct.collectionId} not found`);
    }

    async deleteCollectionProduct(productId: number, collectionId: number): Promise<void> {
        SharedMemory.collection_products = SharedMemory.collection_products.filter(collectionProduct => !(collectionProduct.productId === productId && collectionProduct.collectionId === collectionId));
    }

    async deleteCollectionProductsByCollectionId(collectionId: number): Promise<void> {
        SharedMemory.collection_products = SharedMemory.collection_products.filter(collectionProduct => collectionProduct.collectionId !== collectionId);
    }

    async readCollectionProductsByCollectionId(collectionId: number): Promise<CollectionProduct[]> {
        return SharedMemory.collection_products.filter(collectionProduct => collectionProduct.collectionId === collectionId);
    }

    async readCollectionProductsByProductId(productId: number): Promise<CollectionProduct[]> {
        return SharedMemory.collection_products.filter(collectionProduct => collectionProduct.productId === productId);
    }

    async readCollectionProductsByCollectionIdAndProductId(collectionId: number, productId: number): Promise<CollectionProduct> {
        const collectionProduct = SharedMemory.collection_products.find(collectionProduct => collectionProduct.productId === productId && collectionProduct.collectionId === collectionId);
        if (!collectionProduct) {
            throw new NotFoundError(`Collection Product with ID ${productId} and Collection ID ${collectionId} not found`);
        }
        return collectionProduct;
    }
    async readPublishedProductByCollectionId(collectionId: number): Promise<CollectionProduct[]> {
        return SharedMemory.collection_products.filter(collectionProduct => collectionProduct.collectionId === collectionId && collectionProduct.product?.status === ProductStatus.PUBLISHED);
    }

}