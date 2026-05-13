import { Address } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const listClientAddressesUseCase = async (type?: string): Promise<Address[]> => {
    const clientRepository = await getInjection("IClientRepository");
    const authService = await getInjection("IAuthenticationService");
    const user = await authService.getUser();
    
    if (!user) {
        throw new UnauthorizedError("User not found");
    }
    const client = await clientRepository.read(user.id);
    const adresses = await clientRepository.getListAddress({clientNumber: client.clientNumber});


    return adresses;
}