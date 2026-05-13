import { UserRoles } from "../../models/User";
import { UnauthorizedError } from "../../types/error";
import { getInjection } from "../../types/di";

export const updateStoresUseCase = async (id: number, storesUpdate: number[]) => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError("User not authenticated");
    }

    user.validateRole([UserRoles.EDITOR, UserRoles.SUPER_ADMIN])

    const storeRepository = await getInjection("IStoreRepository");
    const stores = await storeRepository.readByProductId(id);
    
    const storesToAdd = storesUpdate.filter(store => !stores.some(s => s.id === store));
    const storesToRemove = stores.filter(store => !storesUpdate.some(s => s === store.id)).map(s => s.id);

    await storeRepository.addProductToStores(id, storesToAdd);
    await storeRepository.deleteProductFromStores(id, storesToRemove);
}