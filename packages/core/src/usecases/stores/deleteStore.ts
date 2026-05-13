import { getInjection } from "../../types";

export const deleteStoreUseCase = async (id: number): Promise<void> => {
  const storeRepository = await getInjection("IStoreRepository");
  await storeRepository.deleteStore(id);
};
