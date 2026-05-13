import { Client } from "../../models";
import { getInjection } from "../../types";

export const getClientByUserIdUseCase = async (userId: string): Promise<Client> => {
    const clientRepository = await getInjection('IClientRepository');

    const clients = await clientRepository.read(userId);

    return clients;
}