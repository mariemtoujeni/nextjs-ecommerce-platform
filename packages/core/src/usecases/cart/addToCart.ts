import { CartAction, CartActionType, Discount, DiscountTypeValue, ReturnCart } from "../../models";
import { getInjection, UnauthorizedError } from "../../types";
import { bestAutoReduction, conditionMinimalAchatVerifier } from "../discounts";

export const addToCartUseCase = async (action: CartAction): Promise<ReturnCart> => {
  const cartRepository = await getInjection("ICartRepository");
  const authService = await getInjection("IAuthenticationService");

  const user = await authService.getUser();
  if (!user) {
    throw new UnauthorizedError("User not found");
  }
  const userId = user.id;

  const modelRepository = await getInjection("IModelRepository");
  const model = await modelRepository.readModelById(action.modelId);

  let unitPrice = model.priceWithVat;

  let selectedCustomization = null;
  if (action.customizationId) {
    const productRepository = await getInjection("IProductRepository");
    const product = await productRepository.readById(model.productId);

    selectedCustomization = product.customizations?.find(
      (c) => c.id === action.customizationId
    );
    if (selectedCustomization) {
      unitPrice += selectedCustomization.price; 
    }
  }

  const existingItem = await cartRepository.getCartUnit(userId, action.modelId);
  const oldQuantity = existingItem?.quantity || 0;

  let newQuantity = oldQuantity;

  switch (action.type) {
    case CartActionType.INCREMENT:
      newQuantity += 1;
      break;

    case CartActionType.DECREMENT:
      newQuantity = Math.max(0, oldQuantity - 1);
      if (newQuantity === 0) {
        await cartRepository.deleteCartUnit(userId, action.modelId);
        const updatedCart = await cartRepository.getCustomerCart(userId);
        return { outOfStock: false, items: updatedCart };
      }
      break;

    case CartActionType.BULK_ADD:
      const bulkQty = action.quantity || 1;
      newQuantity = oldQuantity + bulkQty;
      if (newQuantity <= 0) {
        if (existingItem) {
          await cartRepository.deleteCartUnit(userId, action.modelId);
        }
        const updatedCart = await cartRepository.getCustomerCart(userId);
        return { outOfStock: false, items: updatedCart };
      }
      break;

    default:
      newQuantity = 1;
      break;
  }

  const quantityDifference = newQuantity - oldQuantity;
  const futureDisponible = await cartRepository.modelStockAvailable(
    action.modelId,
    quantityDifference
  );

  const productRepository = await getInjection("IProductRepository");
  const product = await productRepository.readById(model.productId);

  if (futureDisponible < product.minStock) {
    return { outOfStock: true, items: [] };
  }

  const updatedPrice = newQuantity * unitPrice;

  const hasCustomization = !!action.customizationId;

  if (existingItem) {
    await cartRepository.updateCartunit({
      ...existingItem,
      userId,
      modelId: action.modelId,
      quantity: newQuantity,
      price: updatedPrice,    
      
    }, hasCustomization);
  } else {
    await cartRepository.addCartUnit({
      userId,
      modelId: action.modelId,
      quantity: newQuantity,
      price: updatedPrice,
      textPersonalisation: action.textPersonnalisation,
      typePersonalisation: action.typePersonnalisation,
    }, hasCustomization);
  }

  const currentStock = await cartRepository.getStockByModelId(action.modelId);
  if (!currentStock) {
    return { outOfStock: true, items: [], error: "Stock info not available" };
  }

  const updatedStock = {
    idModel: action.modelId,
    disponible: currentStock.disponible - quantityDifference,
    indisponible: currentStock.indisponible + quantityDifference,
    locked: 0,
    updatedAt: new Date().toISOString(),
  };

  await cartRepository.updateStock(updatedStock);

  const updatedCart = await cartRepository.getCustomerCart(userId);

  return { outOfStock: false, items: updatedCart };
};
