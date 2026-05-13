import { getInjection, UnauthorizedError } from "../../types";
import { GiftCard } from "../../models";

export const getClientGiftVoucherUseCase = async (): Promise<GiftCard[]> => {
     
     const orderRepository = await getInjection('IOrderRepository');
     const clientRepository = await getInjection('IClientRepository');
     const giftCardsRepository = await getInjection('IGiftCardRepository');
     const authService = await getInjection('IAuthenticationService');
     const user = await authService.getUser();
         if (!user) {
             throw new UnauthorizedError("User not found");
         }
     const client = await clientRepository.read(user.id);
     const orders = await orderRepository.read(client.clientNumber);
     const orderIds = orders.map(order => order.id);
     const giftCards = await giftCardsRepository.read(orderIds)
     return giftCards;

}