import { DiscountCart } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const getDiscountCartUseCase = async (): Promise<DiscountCart[]> => {
    const cartRepository = await getInjection("ICartRepository");
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    
    if (!user) {
        throw new UnauthorizedError("User not found");
    }
    const discountCart = await cartRepository.getUserDiscountCart(user.id);

    return discountCart;
}