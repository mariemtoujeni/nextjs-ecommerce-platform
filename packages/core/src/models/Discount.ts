// Modèle représentant une réduction (discount) liée à un utilisateur
import { z } from "zod";
import { ReductionType, ReductionValueType } from "./Order";


export const discountOptionsSchema = z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional().default(''),
    filters: z.array(z.object({
        key: z.string(),
        values: z.union([z.array(z.string()), z.array(z.object({
            key: z.string(),
            values: z.array(z.string())
        }))]),
    })).optional(),
})

export type DiscountFilterInput = z.input<typeof discountOptionsSchema>;
export type DiscountFilter = z.infer<typeof discountOptionsSchema>;

export enum DiscountFilterTypeAdmin {
    TYPE = "TYPE",
    STATE = "STATE",
}

export enum TypeDiscount {
  CLUB = 'CLUB', 
  AVOIR = 'AVOIR', 
  CHEQUE_CADEAU = 'CHEQUE_CADEAU', 
  EXPEDITION = 'EXPEDITION', 
  COMMANDE = 'COMMANDE', 
  X_POUR_Y = 'X_POUR_Y',
  CAMPAGNE = 'CAMPAGNE',
  CODE_PROMO = 'CODE_PROMO',
  ADHERENT_CLUB = 'ADHERENT_CLUB',
}

export enum DiscountState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum ProductShop {
  NATAQUASHOP = 'NATAQUASHOP',
  SWIMWEAR = 'SWIMWEAR',
  CRAZYSWIM = 'CRAZYSWIM'
}

export enum DiscountCombination {
  PRODUIT = 'PRODUIT',
  COMMANDE = 'COMMANDE',
  EXPEDITION = 'EXPEDITION'
}

export enum MinPurchaseCondition {
  MONTANT = 'MONTANT',
  QUANTITE_PRODUIT = 'QUANTITE_PRODUIT'
}

export enum DiscountTypeValue {
  POURCENTAGE = 'POURCENTAGE',
  MONTANT = 'MONTANT'
}

export enum DiscountTypeProduct {
  CONDITION_PROMO = 'CONDITION_PROMO',
  EN_PROMO = 'EN_PROMO',
  COLLECTION = 'COLLECTION',
  MODELE = 'MODELE',
  CATEGORIE = 'CATEGORIE',
  MARQUE = 'MARQUE',
  SOUS_CATEGORIE = 'SOUS_CATEGORIE',
  PRODUIT = 'PRODUIT',
  EXPEDITION = 'EXPEDITION',
}

export type Discount = {
  id: number;
  etat: DiscountState;
  nom: string;
  type: ReductionType;
  id_club: number;
  code: string;
  combinaison: DiscountCombination | null;
  boutique: ProductShop;
  date_debut: Date;
  date_fin?: Date | null;
  id_user: string;
  type_condition_achat_min: MinPurchaseCondition;
  valeur_condition_achat_min: number;
  nombre_maximal_utilisation: number;
  discountLines: DiscountLine[];
} 

export type DiscountInput = Omit<Discount, 'id' | 'discountLines' | 'combinaison' | 'id_user' | 'id_club'>;

export type DiscountLine = {
  id: number,
  id_type: number,
  id_reduction: number,
  country_code: string,
  type: DiscountTypeProduct,
  type_valeur: ReductionValueType,
  valeur: number,
  discount: Discount,
}

export type DiscountLineInput = Omit<DiscountLine, 'id' | 'discount'>;


export type BestProductReduction = {
  type_reduction: ReductionType;
  type_valeur_reduction: ReductionValueType;
  valeur_reduction: number;
  info_reduction: number;
};

export type OrderDiscount = {
  id: number;
  type: ReductionType;
  type_valeur: ReductionValueType;
  id_commande: number;
  id_modele?: number;
  id_reduction?: number;
  valeur: number;
  info: string;
  date: Date;
}

export type OrderDiscountInput = Omit<OrderDiscount, 'id'>;

