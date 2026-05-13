import { Store  } from "../../models";
import { getInjection } from "../../types";

export const updateStoreUseCase = async (store: Store): Promise<Store> => {
  const storeRepository = await getInjection("IStoreRepository");
  const updatedStore = await storeRepository.updateStore(store);

  return updatedStore;
};
