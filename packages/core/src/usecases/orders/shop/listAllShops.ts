import { Shop, ShopFilterInput, ShopOptionsSchema, UserRoles } from "../../../models";
import { BadRequestError, ErrorCodes, getInjection, ReturnAll, UnauthorizedError } from "../../../types";

export const listAllShopsUseCase = async (onlyActive: boolean = false, options?: ShopFilterInput): Promise<ReturnAll<Shop>> => {
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
    user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
    
    const validatedOptions = ShopOptionsSchema.safeParse(options || {});
    if (!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const shopRepository = await getInjection('IShopRepository');
    const shops = await shopRepository.readShops(onlyActive, validatedOptions.data);

    return shops;
}