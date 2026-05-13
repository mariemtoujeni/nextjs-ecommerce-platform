import { Store } from "../../models";
import { getInjection } from "../../types";

export const getStoreByIdUseCase = async (storeId: number): Promise<Store> => {
  const storeRepository = await getInjection("IStoreRepository");
  const store = await storeRepository.readStoreById(storeId);

  return store;
}; 