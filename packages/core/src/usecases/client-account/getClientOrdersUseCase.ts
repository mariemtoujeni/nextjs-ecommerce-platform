// Usecase pour récupérer la liste des commandes du client connecté, triées de la plus récente à la plus ancienne
import { Order } from "../../models";
import { UnauthorizedError, getInjection } from "../../types";

export const getClientOrdersUseCase = async (): Promise<Order[]> => {
    const orderRepository = await getInjection('IOrderRepository');
    const clientRepository = await getInjection('IClientRepository');
    const authService = await getInjection('IAuthenticationService');

    const user = await authService.getUser();
    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    // On récupère le client à partir de l'id utilisateur
    const client = await clientRepository.read(user.id);
    const orders = await orderRepository.read(client.clientNumber);
    // Tri décroissant par date_creation
    return orders.sort((a: Order, b: Order) => b.createdAt.getTime() - a.createdAt.getTime());
} 