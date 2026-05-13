import { getInjection, UnauthorizedError } from "../../types";

export const deleteCartUnitUseCase = async (id: number): Promise<void> => {
  const cartRepository = await getInjection("ICartRepository");
  const authService = await getInjection("IAuthenticationService");

  const user = await authService.getUser();
  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  //get the cart item
  const cartItem = await cartRepository.getCartUnit(user.id, id);
  if (!cartItem) return;

  //get current stock
  const currentStock = await cartRepository.getStockByModelId(cartItem.modelId);
  if (!currentStock) return;

  //calculate and update stock (undo the changes done to the stock by addToCart)
  const updatedStock = {
    idModel: cartItem.modelId,
    disponible: currentStock.disponible + cartItem.quantity,
    indisponible: currentStock.indisponible - cartItem.quantity,
    locked: 0,
    updatedAt: new Date().toISOString(),
  };
  await cartRepository.updateStock(updatedStock);
  await cartRepository.deleteDiscountCart(user.id); // vide les réductions
  //delete the cart unit
  await cartRepository.deleteCartUnit(user.id, id);
};
