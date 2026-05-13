import { Address, AddressFormInput } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const addAddressUseCase = async (address: AddressFormInput): Promise<Address> => {
  const clientRepository = await getInjection("IClientRepository");
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();
  if (!user) {
    throw new UnauthorizedError("User not found"); 
  }
  const client = await clientRepository.read(user.id)

  const createdAddress = await clientRepository.addAddress(address, client);

  return createdAddress;
}