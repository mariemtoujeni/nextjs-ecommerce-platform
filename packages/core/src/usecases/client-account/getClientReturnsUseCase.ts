// Usecase pour récupérer la liste des retours du client connecté, triés du plus récent au plus ancien
import { Return } from "../../models";
import { UnauthorizedError, getInjection } from "../../types";

export const getClientReturnsUseCase = async (): Promise<Return[]> => {
    const returnRepository = await getInjection('IReturnRepository');
    const orderRepository = await getInjection('IOrderRepository');
    const clientRepository = await getInjection('IClientRepository');
    const authService = await getInjection('IAuthenticationService');

    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    // On récupère le client à partir de l'id utilisateur
    const client = await clientRepository.read(user.id);
    // On récupère toutes les commandes du client
    const orders = await orderRepository.read(client.clientNumber);
    const orderIds = orders.map(order => order.id);
    // On récupère les retours liés à ces commandes
    const returns = await returnRepository.read(orderIds);
    
    // Tri décroissant par date_demande
    return returns
    //.sort((a: Return, b: Return) => b.date_demande.getTime() - a.date_demande.getTime());
} 