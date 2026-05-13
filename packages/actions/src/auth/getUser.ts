"use server"
import { getInjection } from "@repo/core/types";

export const getUserAction = async () => {
    const authService = await getInjection('IAuthenticationService');
    const user  = await authService.getUser();
    
    return user ? user.get() : {
        id: "",
        last_name: "",
        first_name: "",
        email: "",
        is_anonymous: true,
        user_role: "",
    };
}