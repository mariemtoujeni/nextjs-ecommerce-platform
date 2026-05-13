import { CategoryFilter, CreateStoreRequest, Store, StoreMenu, StoreMenuLine } from "../models"; 
import { ReturnAll } from "../types";

export interface IStoreRepository {

  createStore(store: CreateStoreRequest): Promise<Store>;
  readStoreById(id: number): Promise<Store>;
  readStoreByName(name: string): Promise<Store>;
  updateStore(store: Store): Promise<Store>;
  deleteStore(id: number): Promise<void>;
  readStoresList(options: CategoryFilter): Promise<ReturnAll<Store>>;

  readByProductId(id: number): Promise<Store[]>;
  addProductToStores(id: number, stores: number[]): Promise<void>;
  deleteProductFromStores(id: number, stores: number[]): Promise<void>;

  readMenu(lang: string): Promise<StoreMenuLine[]>;
}
