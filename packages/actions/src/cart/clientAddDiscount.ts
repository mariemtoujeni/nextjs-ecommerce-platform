'use server';
import { CodeType } from "@repo/core/models";
import { addCodeDiscount } from "@repo/core/usecases";

export const applyDiscountAction = async (formData: FormData): Promise<boolean> => {
  const promo = formData.get("promo-code")?.toString().trim();
  const gift = formData.get("gift-code")?.toString().trim();
  const discountCode = promo || gift;

  if (!discountCode) {
    return false;
  }

  const type_code = promo ? CodeType.CODE_PROMO : CodeType.CHEQUE_CADEAU;

  try {
    const result = await addCodeDiscount(discountCode, type_code);
    return result;
  } catch (error: any) {
    console.error("Error applying discount:", error);
    return false;
  }
};
