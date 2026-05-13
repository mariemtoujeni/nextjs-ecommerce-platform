import { getInjection, UnauthorizedError } from "../../types";
import { Address, FactAddressInput, FactAddressInputSchema } from "../../models";

export const addFcaturationAddressUseCase = async (address: FactAddressInput): Promise<Address> => {
    const clientRepository = await getInjection('IClientRepository');
    const authService = await getInjection('IAuthenticationService');
    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError("User not found");
    }
    const validateAddress = FactAddressInputSchema.parse(address);
    const client = await clientRepository.read(user.id)
    const addAddress = await clientRepository.addFacturationAddress(validateAddress, client )
    return addAddress;

}
