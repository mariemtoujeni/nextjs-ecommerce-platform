import { DeliveryCart, DeliveryCartInput, OrderDeliveryMode } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";

export const updateDeliveryCartUseCase = async (deliveryCart: Partial<DeliveryCartInput>): Promise<DeliveryCart> => {
  const cartRepository = await getInjection("ICartRepository");
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();
  if (!user) {
    throw new UnauthorizedError("User not found");
  }
  const userId = user.id;

  const currentDeliveryCart = await cartRepository.getDeliveryCartbyId(userId);
  if (!currentDeliveryCart) {
    throw Error("No delivery cart to update");
  }

  const clientRepository = await getInjection("IClientRepository");
  const client = await clientRepository.read(user.id);
  const defaultAddress = client.clientAddress.find(addr => addr.default === true);
  if (!defaultAddress) {
    throw new Error("No default address found");
  }

  const mergedDeliveryCart: DeliveryCartInput = {
    ...currentDeliveryCart,
    ...deliveryCart,
    userId: userId,
  };

  let updatedDeliveryCart: DeliveryCart;

  // If delivery mode is AU_MAGASIN, set price to 0
  if (mergedDeliveryCart.deliveryMode === OrderDeliveryMode.AU_MAGASIN) {
    mergedDeliveryCart.prix = 0;
    updatedDeliveryCart = await cartRepository.updateDeliveryCart(mergedDeliveryCart);
  } else {
    // Otherwise update the cart and trigger price calculation
    updatedDeliveryCart = await cartRepository.updateDeliveryCart(mergedDeliveryCart);
    updatedDeliveryCart = await cartRepository.updateDeliveryPriceForCart(updatedDeliveryCart);
  }

  return updatedDeliveryCart;
};
