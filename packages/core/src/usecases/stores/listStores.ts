import { CategoryFilterInput, categoryOptionsSchema, Store } from "../../models";
import { BadRequestError, ReturnAll, getInjection } from "../../types";

export const listStoresUseCase = async (options?: CategoryFilterInput): Promise<ReturnAll<Store>> => {
  const storeRepository = await getInjection("IStoreRepository");

  const validatedOptions = categoryOptionsSchema.safeParse(options || {});
  
  if(!validatedOptions.success) {
      throw new BadRequestError("Invalid options");
  }
  
  const stores = await storeRepository.readStoresList(validatedOptions.data);

  return stores;
};
