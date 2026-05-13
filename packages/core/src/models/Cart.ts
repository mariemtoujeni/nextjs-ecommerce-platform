import { Address } from "./Address";
import { DiscountType } from "./Checkout";
import { DiscountTypeValue, TypeDiscount } from "./Discount";
import { ModelAttributValue } from "./Model";
import { ReductionType, ReductionValueType } from "./Order";
import { ModelWithProductDetail } from "./ProductAlert";
import { OrderDeliveryMode } from "./Quotation";

export enum CartDiscountType {
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

export enum CodeType {
  CODE_PROMO,
  CHEQUE_CADEAU
}

export enum CartActionType {
  INCREMENT, 
  DECREMENT,
  BULK_ADD
}

export type CartAction = {
  type: CartActionType;
  userId: string;
  modelId: number;
  quantity?: number;
  customizationId?: number | null;  
  textPersonnalisation: string;
  typePersonnalisation: string;
};

export type ReturnCart = {
  outOfStock: boolean;
  items: Cart[]
  error?: string;
}

export type ModelProduct = ModelWithProductDetail & {
  attributs: ModelAttributValue[];
}

export type Cart = {
    userId: string;
    modelId: number;
    model: ModelProduct;
    quantity: number;
    shipping: string;
    customization: boolean;
    text: string;
    price: number;
    discountType: ReductionType;
    discountValueType: ReductionValueType;
    discountValue: number;
    discountInfo: string; 
    createdAt?: Date;
    updatedAt?: Date;
    textPersonalisation: string; 
    typePersonalisation : string;  
}

export type CartItem = {
    modelId: number;
    name: string;
    variants: string; 
    price: number,
    imageUrl: string,
    quantity: number,
}

export type CartInput = {
    userId: string;
    modelId: number;
    quantity: number;
    price: number;
    textPersonalisation: string;
    typePersonalisation: string;
}

export type DeliveryCart = {
    userId: string;
    deliveryMode: OrderDeliveryMode;
    billingAddressId: number; 
    relaisId: string;
    weight: number;
    prix: number;
    company: string;
    lastName: string;
    firstName: string;
    adress: string;
    adress2: string;
    adress3: string;
    postCode: string;
    city: string;
    country: string;
    clientAddressId?: number;
    valid: boolean;
    billingAddress: Address[];
    clientAddress: Address[];
}

export type DeliveryCartInput = Omit<DeliveryCart, 'billingAddress' | 'clientAddress'>;


export type FormCheckout = {
  token : string;
  pubKey: string;
}

export type CreateAdminAlert = {
    fonction: string;
    message: string;
    metadata?: any;
}

export type DiscountCart = {
  userId: string;
  id: number;
  discountType: ReductionType;
  discountTypeValue:  ReductionValueType;
  value: number;
  info: string;
}

export type DiscountCartInput = Omit<DiscountCart, 'id'>;