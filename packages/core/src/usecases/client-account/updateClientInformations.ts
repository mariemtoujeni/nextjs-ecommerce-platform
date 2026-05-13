import { Client, ClientUpdateInput, dataClientInput } from "../../models";
import { ReturnAll, UnauthorizedError, getInjection } from "../../types";

export const updateClientInformationsUseCase = async (newClientInformations: dataClientInput): Promise<Client> => {
    const generalClientInformations = await getInjection('IClientRepository');
    const authService = await getInjection('IAuthenticationService');

    const user = await authService.getUser();

    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    const updatedClientInformations = await generalClientInformations.updateInformationClient(newClientInformations,user.id)

    return updatedClientInformations;
}