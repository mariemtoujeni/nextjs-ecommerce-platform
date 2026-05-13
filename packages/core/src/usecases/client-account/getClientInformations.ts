import { Client } from "../../models";
import { ReturnAll, UnauthorizedError, getInjection } from "../../types";

export const getClientInformationsUseCase = async (): Promise<Client> => {
    const clientRepository = await getInjection('IClientRepository');
    const authService = await getInjection('IAuthenticationService');

    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    const client = await clientRepository.read(user.id);
  
    return client;
}