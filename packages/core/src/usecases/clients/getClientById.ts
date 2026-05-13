import { Client } from "../../models";
import { getInjection } from "../../types";

export const getClientByIdUseCase = async (id: number): Promise<Client> => {
    const clientRepository = await getInjection('IClientRepository');

    const clients = await clientRepository.readByClientNumber(id);

    return clients;
}