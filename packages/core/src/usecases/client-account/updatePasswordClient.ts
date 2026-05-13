import { getInjection, UnauthorizedError } from "../../types";
import { Client, passwordClientInput } from "../../models";

export const updatePasswordClientUseCase = async (newPasswordClient: passwordClientInput): Promise<void> => {
    const passwordClient = await getInjection('IClientRepository');
    const authService = await getInjection('IAuthenticationService');

    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError("User not found");
    }
    const updatePasswordClient = await passwordClient.updatePasswordClient(newPasswordClient, user.id)
    return updatePasswordClient;
}
