import { SignUpRequestWithoutPassword } from "../../models";
import { getInjection } from "../../types";

export const updateUserUseCase = async (user: SignUpRequestWithoutPassword, clientNumber: number): Promise<number> => {
    const authService = await getInjection("IUserRepository");
    return await authService.updateUserByAdmin(user, clientNumber);
};
