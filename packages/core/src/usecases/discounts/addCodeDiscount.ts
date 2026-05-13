import { getInjection } from "../../types/di";
import { UnauthorizedError } from "../../types/error";
import { CodeType, ReductionType } from "../../models";
import { bestAutoReduction } from "./bestAuto";

export const addCodeDiscount = async ( code: string, type_code: CodeType ): Promise<boolean> => {
  const authService = await getInjection("IAuthenticationService");
  const cartRepository = await getInjection("ICartRepository");
  const discountRepository = await getInjection("IDiscountRepository");
 
  const user = await authService.getUser();
  if (!user) throw new UnauthorizedError("User not authenticated");
 
  const reductionLines = await discountRepository.readCodeDiscount(code);
  if (reductionLines.length === 0) return false;
 
  const firstReductionLine = reductionLines[0];
  if (!firstReductionLine || !firstReductionLine.discount) return false;
  
  const discount = firstReductionLine.discount;
 
  const cartDiscounts = await cartRepository.getUserDiscountCart(user.id);

  const existingDiscount = cartDiscounts.find(d => {
    try {
      const parsed = JSON.parse(d.info);
      return parsed.code === code;
    } catch {
      return d.info === code;
    }
  });
 
  let currentUsage = 0;
 
  if (existingDiscount) {
    try {
      const parsed = JSON.parse(existingDiscount.info);
      currentUsage = parsed.currentUsage || 0;
    } catch {
      currentUsage = 0;
    }
  }
 
  const maxUsage = discount.nombre_maximal_utilisation;
  if (maxUsage !== null && maxUsage !== undefined && currentUsage >= maxUsage) {
    return false; 
  }
 
  if (existingDiscount) {
    const newUsage = currentUsage + 1;
   
    if (maxUsage !== null && maxUsage !== undefined && newUsage > maxUsage) {
      return false;
    }
   
    try {
      const existingInfo = JSON.parse(existingDiscount.info);
      const updatedInfo = {
        ...existingInfo,
        currentUsage: newUsage
      };
      await cartRepository.updateDiscountCart({
        ...existingDiscount,
        info: JSON.stringify(updatedInfo)
      });
     
      return true;
    } catch {
      await cartRepository.deleteDiscountCart(user.id);
    }
  }
 
  const cart = await cartRepository.getCustomerCart(user.id);
  let applied = false;
 
  for (const p of cart) {
    const discountResult = await bestAutoReduction(p.modelId, 1, code);
   
    if (discountResult) {
      const initialUsage = existingDiscount ? currentUsage + 1 : 1;
      if (maxUsage !== null && maxUsage !== undefined && initialUsage > maxUsage) {
        continue;
      }
     
      await cartRepository.addDiscountCart({
        userId: user.id,
        discountType:
          type_code === CodeType.CODE_PROMO
            ? ReductionType.CODE_PROMO
            : ReductionType.CHEQUE_CADEAU,
        discountTypeValue: discountResult.type_valeur_reduction,
        value: discountResult.valeur_reduction,
        info: JSON.stringify({
          code,
          modelId: p.modelId,
          currentUsage: initialUsage,
          maxUsage: maxUsage,
          discountId: discount.id
        }),
      });
      applied = true;
    }
  }
 
  return applied;
};