import { User, UserWithoutPassword } from "../../models";
import { getInjection } from "../../types";


export const getUserUseCase = async (): Promise<UserWithoutPassword> => {
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