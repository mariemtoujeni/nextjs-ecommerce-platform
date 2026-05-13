import { BadRequestError, ErrorCodes, getInjection, UnauthorizedError } from "../../../types";
import { Shop, ShopInput, shopInputSchema, UserRoles } from "../../../models";

export const updateShopUseCase = async (id: number, shop: ShopInput) : Promise<Shop> => {    
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const validatedShop = shopInputSchema.safeParse(shop);
    if (!validatedShop.success) {
        throw new BadRequestError(validatedShop.error.message);
    }

    const shopRepository = await getInjection('IShopRepository');
    const shopUpdated = await shopRepository.updateShop(id, shop);
    return shopUpdated;
}