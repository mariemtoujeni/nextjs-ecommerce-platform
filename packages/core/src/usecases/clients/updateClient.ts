import { Client, ClientUpdateInput, Club } from "../../models";
import { getInjection } from "../../types";


export const updateClientUseCase = async (client: ClientUpdateInput, club?: Club): Promise<Client> => {
    const clientRepository = await getInjection('IClientRepository');
    if (club){
        await clientRepository.updateClub(club);
    }
    await clientRepository.updateClient(client);

    const updatedClient = clientRepository.readByClientNumber(client.clientNumber)
    return updatedClient;
}