import { Address, defaultAddress } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const updateAddressUseCase = async(address: defaultAddress): Promise<Address> => {
    const clientRepository = await getInjection('IClientRepository');
    const authService = await getInjection('IAuthenticationService');

    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError("User not found");
    }
    const numeroClient = await clientRepository.getNumeroClientByUserId(user.id);
      if (!numeroClient) {
    throw new UnauthorizedError("Numero client not found for user");
  }
     
     if (address.default) {
    await clientRepository.resetDefaultAddresses(numeroClient, address.id);
  }

    const updatedAddress = await clientRepository.updateAddress(address);
   
        

    return updatedAddress;
}