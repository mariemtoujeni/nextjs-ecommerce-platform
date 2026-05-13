import { getInjection } from "../../types/di";
import { UnauthorizedError } from "../../types/error";
import { ReductionValueType } from "../../models";

export interface CartSummary {
  subTotalWithoutVAT: number;
  subTotalWithVAT: number;
  discount: number;
  deliveryTTC: number;
  total: number;
}

export const getCartSummaryUseCase = async (): Promise<CartSummary> => {
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  const cartRepository = await getInjection("ICartRepository");

  const customerCart = await cartRepository.getCustomerCart(user.id);
  const customerDeliveryCart = await cartRepository.getDeliveryCartbyId(user.id);
  if (!customerDeliveryCart) {
    throw Error("No customer delivery cart");
  }

  const customerDiscountCarts = await cartRepository.getUserDiscountCart(user.id);

  const totalWithoutVAT = customerCart.reduce( (acc, p) => acc + p.model.priceWithoutVat * p.quantity, 0 );
  const totalWithVAT = customerCart.reduce( (acc, p) => acc + p.model.priceWithVat * p.quantity, 0 );

  let discount = 0;
  for (const customerDiscountCart of customerDiscountCarts || []) {
    if (customerDiscountCart.discountTypeValue === ReductionValueType.MONTANT) {
      discount += customerDiscountCart.value ?? 0;
    } else {
      discount += totalWithoutVAT * ((customerDiscountCart.value ?? 0) / 100);
    }
  }

  // ensure discount is never NaN
  if (isNaN(discount)) {
    discount = 0;
  }

  const vatRate = (totalWithVAT - totalWithoutVAT) / totalWithoutVAT;
  const discountedWithoutVAT = totalWithoutVAT - discount;
  const deliveryTTC = customerDeliveryCart.prix;
  const total = discountedWithoutVAT + deliveryTTC + discountedWithoutVAT * vatRate;

  const format = (value: number) => Number(value.toFixed(2));
  return {
    subTotalWithoutVAT: format(totalWithoutVAT),
    subTotalWithVAT: format(totalWithVAT),
    discount: format(discount),
    deliveryTTC: format(deliveryTTC),
    total: format(total),
  };
};
