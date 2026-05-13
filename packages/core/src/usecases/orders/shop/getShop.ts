import { ErrorCodes, getInjection, UnauthorizedError } from "../../../types";
import { ShopPresenter, UserRoles } from "../../../models";

export const getShopUseCase  = async (id: number) : Promise<ShopPresenter> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const shopRepository = await getInjection('IShopRepository');
    const shop = await shopRepository.readShopById(id);
    return shop;
}