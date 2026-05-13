import { Client } from "../../models";
import { getInjection } from "../../types";

export const deleteClientDataUseCase = async (id: number): Promise<Client> => {
    const clientRepository = await getInjection('IClientRepository');
    const client = await clientRepository.deleteClientData(id);

    return client;
};
