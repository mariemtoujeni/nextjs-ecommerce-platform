import { UnauthorizedError } from "../../types/error";
import { BestProductReduction, Discount, DiscountLine, DiscountTypeProduct, DiscountTypeValue, MinPurchaseCondition, ModelWithProduct, ReductionValueType, TypeDiscount } from "../../models";
import { getInjection } from "../../types/di";

export const conditionMinimalAchatVerifier = async ( reduction: Discount, montant: number, quantite: number ): Promise<boolean> => {
  if (!reduction.type_condition_achat_min) {
    return true;
  }

  if (
    reduction.type_condition_achat_min === MinPurchaseCondition.MONTANT &&
    reduction.valeur_condition_achat_min <= montant * quantite
  ) {
    return true;
  }

  if (
    reduction.type_condition_achat_min === MinPurchaseCondition.QUANTITE_PRODUIT &&
    reduction.valeur_condition_achat_min <= quantite
  ) {
    return true;
  }

  return false;
};


const computePromoAmount = (reductionLigne: DiscountLine, modele: ModelWithProduct): number => {
  if (reductionLigne.type_valeur === ReductionValueType.MONTANT) {
    return reductionLigne.valeur;
  } else if (reductionLigne.type_valeur === ReductionValueType.PERCENTAGE) {
    return (modele.priceWithoutVat * reductionLigne.valeur) / 100;
  }
  return 0;
};

const getBestReduction = ( reductionLigne: DiscountLine, modele: ModelWithProduct, bestProductReduction: BestProductReduction | undefined, quantite: number ): BestProductReduction => {
  if (reductionLigne.type !== DiscountTypeProduct.EXPEDITION) {
    const montantReduction = computePromoAmount(reductionLigne, modele);
    if (!bestProductReduction || bestProductReduction.valeur_reduction < montantReduction * quantite) {
      return {
        type_reduction: reductionLigne.discount.type,
        type_valeur_reduction: reductionLigne.type_valeur,
        valeur_reduction: montantReduction * quantite,
        info_reduction: reductionLigne.discount.id
      };
    }
  } else {
    // Only apply if it's a fixed amount, as percentage can't be calculated before knowing shipping cost
    if ( !bestProductReduction || bestProductReduction.valeur_reduction < reductionLigne.valeur * quantite ) {
      return {
        type_reduction: reductionLigne.discount.type,
        type_valeur_reduction: reductionLigne.type_valeur,
        valeur_reduction: reductionLigne.valeur * quantite,
        info_reduction: reductionLigne.discount.id
      };
    }
  }
  return bestProductReduction!;
};

export const bestAutoReduction = async ( modeleId: number, quantite: number, codePromo: string = "" ): Promise<BestProductReduction | undefined> => {
  const authService = await getInjection("IAuthenticationService");
  const clientRepository = await getInjection("IClientRepository");
  const discountRepository = await getInjection("IDiscountRepository");
   const modelRepository = await getInjection('IModelRepository');
  const user = await authService.getUser();
  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  const client = await clientRepository.read(user.id);
  const modele = await modelRepository.readModelWithProductById(modeleId);
  let bestProductReduction: BestProductReduction | undefined = undefined;
  let reductionLignes: DiscountLine[] = [];

  const [reductionLignesClub, reductionLignesAdhe, reductionLignesCompagne] = await Promise.all([
    discountRepository.readClubDiscount(client.clubId),
    discountRepository.readClubDiscount(client.clubMemberId),
    discountRepository.readCampagneDiscount()
  ]);

  reductionLignes = [...reductionLignesClub, ...reductionLignesAdhe, ...reductionLignesCompagne];

  // if (codePromo && codePromo !== "") {
  //   const reductionCodePromo = await discountRepository.readCodeDiscount(codePromo);
  //   reductionLignes = [...reductionLignes, ...reductionCodePromo];
  // }
  if (codePromo && codePromo !== "") {
    const reductionCodePromo = await discountRepository.readCodeDiscount(codePromo);
    reductionLignes = reductionCodePromo; 
  } else {
    reductionLignes = [
      ...reductionLignesClub,
      ...reductionLignesAdhe,
      ...reductionLignesCompagne
    ];
  }


  // Remove duplicates by ID
  const initialCount = reductionLignes.length;
  reductionLignes = reductionLignes.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  const dedupedCount = reductionLignes.length;

  for (const reductionLigne of reductionLignes) {
    const applies = await conditionMinimalAchatVerifier(
      reductionLigne.discount,
      modele.priceWithoutVat,
      quantite
    );

    if (!applies) continue;
    
    const matches =
      (reductionLigne.type === DiscountTypeProduct.CATEGORIE &&
        reductionLigne.id_type === modele.product.categoryId) ||
      (reductionLigne.type === DiscountTypeProduct.MODELE &&
        reductionLigne.id_type === modele.id) ||
      (reductionLigne.type === DiscountTypeProduct.MARQUE &&
        reductionLigne.id_type === modele.product.brandId) ||
      (reductionLigne.type === DiscountTypeProduct.SOUS_CATEGORIE &&
        reductionLigne.id_type === modele.product.subCategoryId) ||
      (reductionLigne.type === DiscountTypeProduct.PRODUIT &&
        reductionLigne.id_type === modele.productId) ||

       reductionLigne.type === DiscountTypeProduct.COLLECTION || 
       reductionLigne.type === DiscountTypeProduct.EXPEDITION ||
       reductionLigne.type === DiscountTypeProduct.EN_PROMO

    if (matches) {
      bestProductReduction = getBestReduction(
        reductionLigne,
        modele,
        bestProductReduction,
        quantite
      );

    }
  }
  return bestProductReduction;
};

