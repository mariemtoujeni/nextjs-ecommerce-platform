import { NotFoundError, UnauthorizedError } from "../../types/error";
import { OnlineShop } from "../../models/Product";
import { getInjection } from "../../types/di";
import { UserRoles } from "../../models";

export const updateOnlineShops = async (id: number, update: OnlineShop[]) => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    if(!user) {
        throw new UnauthorizedError("User not authenticated");
    }

    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);

    const productRepository = await getInjection("IProductRepository");
    const onlineShopes = await productRepository.readOnlineShopsByProductId(id);

    const toAdd = update.filter(shop => !onlineShopes.some(os => os === shop));
    const toRemove = onlineShopes.filter(os => !update.some(shop => shop === os));

    await productRepository.addOnlineShops(id, toAdd);
    await productRepository.removeOnlineShops(id, toRemove);
}