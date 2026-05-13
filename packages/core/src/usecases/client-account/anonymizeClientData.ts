import { Client } from "../../models"
import { getInjection, UnauthorizedError } from "../../types";

export const anonymizeClientDataUseCase= async (): Promise<Client> => {

    const clientRepository = await getInjection('IClientRepository');
        const authService = await getInjection('IAuthenticationService');
        const user = await authService.getUser();
    
        if (!user) {
            throw new UnauthorizedError("User not found");
        }
        
        const anonymizeClient = await clientRepository.anonymizeClientData()
    return anonymizeClient;

}