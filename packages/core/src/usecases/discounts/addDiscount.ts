import { Discount, DiscountCombination, DiscountState, DiscountTypeProduct, DiscountTypeValue, MinPurchaseCondition, ProductShop, ReductionType, ReductionValueType, TypeDiscount, UserRoles } from "@repo/core/models";
import { ErrorCodes, getInjection, UnauthorizedError } from "@repo/core/types";

export const addDiscountUseCase = async (type: DiscountCombination, productShop: ProductShop = ProductShop.NATAQUASHOP): Promise<Discount> => {

  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();

  if (!user) {
    throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
  }
  user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]); 

  const discountRepository = await getInjection("IDiscountRepository");
  // Start date: tomorrow at midnight
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() + 1);


  let typeDiscount: ReductionType | null = null;

  if (type === DiscountCombination.PRODUIT) {
    typeDiscount = ReductionType.CAMPAGNE;
  } else if (type === DiscountCombination.COMMANDE) {
    typeDiscount = ReductionType.COMMANDE;
  }

  const createdDiscount = await discountRepository.addDiscount({
    etat: DiscountState.INACTIVE,
    nom: "",
    type: typeDiscount ?? ReductionType.COMMANDE,
    code: "",
    boutique: productShop,
    date_debut: startDate,
    type_condition_achat_min: MinPurchaseCondition.MONTANT,
    valeur_condition_achat_min: 0,
    nombre_maximal_utilisation: -1,
  });

  const createdDiscountLine = await discountRepository.addDiscountLine({
    type: type === DiscountCombination.COMMANDE ? DiscountTypeProduct.CONDITION_PROMO : DiscountTypeProduct.EN_PROMO,
    valeur: 0,
    type_valeur: ReductionValueType.PERCENTAGE,
    id_type: 0,
    id_reduction: createdDiscount.id,
    country_code: "FR"
  });



  return createdDiscount;
};
