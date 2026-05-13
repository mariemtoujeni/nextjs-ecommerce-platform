import { Cart } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const listCartItemsUseCase = async (anon_userId?: string): Promise<Cart[]> => {
    const cartRepository = await getInjection("ICartRepository");
    if (anon_userId) {
        const cart = await cartRepository.getCustomerCart(anon_userId);
        return cart; 
    }

    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    const cart = await cartRepository.getCustomerCart(user.id);
    return cart;
}
