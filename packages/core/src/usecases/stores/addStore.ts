import { CreateStoreRequest, Store } from "../../models";
import { getInjection } from "../../types";

export const addStoreUseCase = async (store: CreateStoreRequest): Promise<Store> => {
  const storeRepository = await getInjection("IStoreRepository");
  const createdStore = await storeRepository.createStore(store);

  return createdStore;
}