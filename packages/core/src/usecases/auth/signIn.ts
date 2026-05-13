import { UnauthorizedError } from "../../types/error";
import { CartActionType, User } from "../../models";
import { getInjection } from "../../types/di";
import { addToCartUseCase, deleteCartUnitUseCase, listCartItemsUseCase } from "../cart";

export type SignInUseCase = {
    email: string;
    password: string;
    checkAdmin?: boolean;
}

export const signInUseCase = async (request: SignInUseCase): Promise<User> => {

    const authService = await getInjection('IAuthenticationService');
    const anonymUser = await authService.getUser();
    const anonymUserId = anonymUser?.id;
    
    const user = await authService.signIn(request.email, request.password);
    
    if(request.checkAdmin && !user.user_role.includes("admin")) {
        throw new UnauthorizedError("User is not an admin");
    }
    if (anonymUserId) {
        const anon_products = await listCartItemsUseCase(anonymUserId)
        // clear anon cart items
        for (const item of anon_products) {
            await deleteCartUnitUseCase(item.model.id);  
        }
        // add to authenticated user cart
        for (const item of anon_products) {
            await addToCartUseCase({
                type: CartActionType.BULK_ADD,
                userId: user.id,
                modelId: item.model.id,
                quantity: item.quantity,
                textPersonnalisation: item.textPersonalisation,
                typePersonnalisation: item.typePersonalisation,
            }); 
        }
    }
    return user;
}