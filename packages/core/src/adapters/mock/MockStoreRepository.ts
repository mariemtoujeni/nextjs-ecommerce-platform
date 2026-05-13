import { CategoryFilter, Store, StoreMenuLine } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { InternalServerError } from "../../types/error";
import { ReturnAll } from "../../types/utils";
import { IStoreRepository } from "../../repositories";

export class MockStoreRepository implements IStoreRepository {

    async createStore(data: Store): Promise<Store> {
        SharedMemory.stores.push(data);
        return data;
    }

    async readStoreById(id: number): Promise<Store> {
        const store = SharedMemory.stores.find(store => store.id === id);
        if (!store) {
            throw new InternalServerError('Store not found');
        }
        return store;
    }

    async readStoreByName(name: string): Promise<Store> {
        const store = SharedMemory.stores.find(store => store.name === name);
        if (!store) {
            throw new InternalServerError('Store not found');
        }
        return store;
    }

    async updateStore(data: Store): Promise<Store> {
        const index = SharedMemory.stores.findIndex(store => store.id === data.id);
        SharedMemory.stores[index] = data;
        return data;
    }

    async deleteStore(id: number): Promise<void> {
        SharedMemory.stores = SharedMemory.stores.filter(store => store.id !== id);
    }

    async readStoresList(options: CategoryFilter): Promise<ReturnAll<Store>> {
        const { limit, offset, sort } = options;

        const stores = 'asc' == sort
            ? [...SharedMemory.stores].sort((a, b) => a.id - b.id).slice(offset, offset + limit)
            : [...SharedMemory.stores].sort((a, b) => b.id - a.id).slice(offset, offset + limit);

        return {
            total: SharedMemory.stores.length,
            count: stores.length,
            items: stores,
        };
    }

    async readByProductId(id: number): Promise<Store[]> {
        return SharedMemory.productStores.filter(store => store.productId === id).map(store => SharedMemory.stores.find(s => s.id === store.storeId)!);
    }
    async addProductToStores(id: number, stores: number[]): Promise<void> {
        stores.forEach(store => {
            SharedMemory.productStores.push({ productId: id, storeId: store });
        });
    }
    async deleteProductFromStores(id: number, stores: number[]): Promise<void> {
        SharedMemory.productStores = SharedMemory.productStores.filter(store => store.productId !== id || !stores.includes(store.storeId));
    }

    async readMenu(lang: string): Promise<StoreMenuLine[]> {
        return SharedMemory.storeMenuLines;
    }
}
