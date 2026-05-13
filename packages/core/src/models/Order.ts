import { OrderDeliveryMode } from "./Quotation";
import { z } from "zod";
import { Supplier } from "./Supplier";
import { ModelProductDetail } from "./Checkout";
import { Client } from "./Client";
import { ShippingDataForSupplierInput, ShippingDataForSupplierPresenter, ShippingDataForSupplierPresenterInput } from "./Shipment";

export enum AdminOrderFilterType {
  STATUS = "STATUS",
  BOUTIQUE = "BOUTIQUE",
  MODE_LIVRAISON = "MODE_LIVRAISON",
  DEVIS = "DEVIS"
}

export enum OrderStatus {
  ATTENTE_ACCEPTATION_DEVIS = 'ATTENTE_ACCEPTATION_DEVIS',
  ATTENTE_PAIMENT = 'ATTENTE_PAIMENT',
  PAIMENT_ACCEPTE = 'PAIEMENT_ACCEPTE',
  PREPARATION = 'PREPARATION',
  EXPEDIEE_PARTIELLEMENT = 'EXPEDIEE_PARTIELLEMENT',
  EXPEDIEE = 'EXPEDIEE',
  AUTRE_1 = 'AUTRE_1',
  AUTRE_2 = 'AUTRE_2',
  DEVIS_ARCHIVE = 'DEVIS_ARCHIVE',
}

export enum OrderBoutique {
  NATAQUASHOP = "NATAQUASHOP",
  SWIMWEAR = "SWIMWEAR",
  CRAZYSWIM = "CRAZYSWIM"
}

export enum OrderModeLivraison {
  COLISSIMO = "COLISSIMO",
  SO_COLISSIMO = "SO_COLISSIMO",
  CHRONOPOST = "CHRONOPOST",
  CHRONOPOST_RELAIS = "CHRONOPOST_RELAIS",
  AU_MAGASIN = "AU_MAGASIN",
  AU_CLUB = "AU_CLUB",
  NON_LIVRABLE = "NON_LIVRABLE",
  MANUEL = "MANUEL",
  EXPEDITOR = "EXPEDITOR",
  MONDIAL_RELAIS = "MONDIAL_RELAIS",
  EXAPAQ = "EXAPAQ",
  ICI_RELAIS = "ICI_RELAIS",
}

export enum OrderDevis {
  OUI = "OUI",
  NON = "NON"
}

export enum PaymentMode {
  CHEQUE = 'CHEQUE',
  VIREMENT = 'VIREMENT',
  CARTE_BANCAIRE = 'CARTE_BANCAIRE',
  PAYPAL = 'PAYPAL',
  ESPECE = 'ESPECE',
  AUTRE = 'AUTRE',
  SYSTEMPAY= 'SYSTEMPAY',
}

export enum PurchaseOrderStatus {
  BROUILLON = 'BROUILLON',
  PARTIELLE = 'PARTIELLE',
  ENVOYEE = 'ENVOYEE',
  RECU = 'RECU',
  ANNULEE = 'ANNULEE',
}

export enum AddressType {
  FACTURATION = 'FACTURATION',
  LIVRAISON = 'LIVRAISON',
}

export enum OrderEtat {
  NORMAL = 'NORMAL',
  //...
}

export enum ReductionType {
  CLUB = 'CLUB',
  CODE_PROMO = 'CODE_PROMO',
  ADHERENT_CLUB = 'ADHERENT_CLUB',
  CAMPAGNE = 'CAMPAGNE',
  X_POUR_Y = 'X_POUR_Y',
  COMMANDE = 'COMMANDE',
  EXPEDITION = 'EXPEDITION',
  CHEQUE_CADEAU = 'CHEQUE_CADEAU',
  AVOIR = 'AVOIR',
  NONE = 'NONE'
}

export enum ReductionValueType {
  PERCENTAGE = 'POURCENTAGE',
  MONTANT = 'MONTANT',
}

export enum NumeroCompteNataquashop {
  CLIENT_CB = "4110000",
  REMBOURSEMENT = "411AVOIR",
  CLIENT_CHEQUE = "411cheque",
  CLIENT_VIREMENT = "411vir00",
  VENTE_DU_SITE_20 = "70705",
  VENTE_DU_SITE_0 = "70710",
  VENTE_DU_CLUBS_20 = "70735",
  VENTE_DU_CLUBS_CHEQUE_CADEAU = "70792",
  TVA_20 = "445712",
  TVA_5_5 = "445711"
}

export enum NumeroCompteSwimwear {
  CLIENT_CB = "41101000",
  VENTE_DU_SITE_20 = "70707",
  TVA_20 = "445712",
  CLIENT_VIREMENT = "411vir00",
}

export enum NumeroCompteCrazyswim {
  CLIENT_CB = "41100000",
  VENTE_DU_SITE_20 = "70101000",
  TVA_20 = "445712",
}

export const OrderOptionsSchema = z.object({
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
  })).optional()
});

export type OrderFilterInput = z.input<typeof OrderOptionsSchema>;
export type OrderFilter = z.infer<typeof OrderOptionsSchema>;

export const OrderSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  status: z.nativeEnum(OrderStatus),
  createdAt: z.date(),
  amount: z.number(),
  deliveryFees: z.number(),
  withoutVAT: z.boolean(),
  quotation: z.boolean(),
  deliveryMode: z.nativeEnum(OrderDeliveryMode),
  usedCredit: z.number(),
  totalDiscount: z.number(),
  authorisation: z.string(),
  paymentMode: z.string(),
  authorisationDate: z.date(),
  usedPoints: z.number().optional(),
  clientComment: z.string().optional(),
  boutique: z.string().optional(),
});

export type Order = {
  id: number;
  clientId: number;
  status: OrderStatus;
  createdAt: Date;
  amount: number;
  deliveryFees: number; 
  withoutVAT: boolean;
  quotation: boolean;
  deliveryMode: OrderDeliveryMode;
  usedCredit: number; 
  totalDiscount: number;
  authorisation: string;
  paymentMode: string;
  authorisationDate: Date;
  usedPoints?: number;
  clientComment?: string;
  boutique?: string;
}

export const OrderLineSchema = z.object({
  id: z.number().optional(),
  orderId: z.number(),
  modelId: z.number(),
  reductionType: z.nativeEnum(ReductionType).optional(),
  reductionValueType: z.nativeEnum(ReductionValueType).optional(),
  reductionValue: z.number().min(0).optional(),
  reductionInfo: z.string().optional(),
  barCode: z.string().optional(),
  manufacturerRef: z.string().optional(),
  name: z.string().optional(),
  quantity: z.number().min(0).optional(),
  unitPriceExclTax: z.number().min(0).optional(),
  vat: z.number().min(0).optional(),
  totalPriceInclTax: z.number().min(0).optional(),
  totalPriceExclTax: z.number().min(0).optional(),
  giftVoucher: z.boolean().optional(),
  voucherDuration: z.number().optional(),
  weight: z.number().optional(),
  comment: z.string().optional(),
  available: z.boolean().optional(),
  createdAt: z.date().optional(),
  returnedAt: z.date().optional(),
  textPersonnalisation: z.string().optional(),
  typePersonnalisation: z.string().optional(),
});

export type OrderLine = {
  id: number;
  orderId: number;
  modelId: number;
  model?: ModelProductDetail;
  reductionType: ReductionType;
  reductionValueType: ReductionValueType;
  reductionValue: number;
  reductionInfo: string;
  barCode: string;
  manufacturerRef: string;
  name: string;
  quantity: number;
  unitPriceExclTax: number;
  vat: number;
  totalPriceInclTax: number;
  totalPriceExclTax: number;
  giftVoucher: boolean;
  voucherDuration: number;
  weight: number;
  comment: string;
  available: boolean;
  createdAt: Date;
  returnedAt: Date;
  textPersonnalisation: string;
  typePersonnalisation:string;
}

export type OrderWithClient = Order & {
  client: Client;
  addresses?: OrderAddress[];
}

export type OrderPresenter = OrderWithClient & {
  lines: (OrderLine & { model: ModelProductDetail })[];
}

export type OrderLineInput = z.infer<typeof OrderLineSchema>;
export enum OrderState {
  NORMAL = "NORMAL",
  CLIENT_COMMANDE_FRS = "CLIENT_COMMANDE_FRS",
  CLIENT_MARQUAGE_PROBLEME = "CLIENT_MARQUAGE_PROBLEME",
  CLIENT_A_SURVEILLER = "CLIENT_A_SURVEILLER",
  CLIENT_RETARD_FOURNISSEUR = "CLIENT_RETARD_FOURNISSEUR",
  CLIENT_NE_PAS_RELANCER = "CLIENT_NE_PAS_RELANCER",
  NIVEAU_1_CREA_LOGO = "NIVEAU_1_CREA_LOGO",
  NIVEAU_1_DEVIS_CLUB = "NIVEAU_1_DEVIS_CLUB",
  NIVEAU_2_BAT_NON_VALIDE_BONNET_CLUB = "NIVEAU_2_BAT_NON_VALIDE_BONNET_CLUB",
  NIVEAU_2_BAT_VALIDE_BONNET_CLUB = "NIVEAU_2_BAT_VALIDE_BONNET_CLUB",
  NIVEAU_4_CREA_BOUT_CLUB_BAT_VALIDE = "NIVEAU_4_CREA_BOUT_CLUB_BAT_VALIDE",
  NIVEAU_4_CREA_BOUT_CLUB_BAT_NON_VALIDE = "NIVEAU_4_CREA_BOUT_CLUB_BAT_NON_VALIDE",
  NIVEAU_3_MARQUAGE_BAT_NON_VALIDE_CLUB = "NIVEAU_3_MARQUAGE_BAT_NON_VALIDE_CLUB",
  NIVEAU_3_MARQUAGE_BAT_VALIDE_CLUBBAT = "NIVEAU_3_MARQUAGE_BAT_VALIDE_CLUBBAT",
  CLUB_KIT_ESSAYAGE = "CLUB_KIT_ESSAYAGE",
  CHEQUES_CADEAUX = "CHEQUES_CADEAUX",
  DEFECTUEUX_EN_ATTENTE= "DEFECTUEUX_EN_ATTENTE"
}

export type OrderAdmin = {
  comment: string;
  state: OrderState;
}

export type OrderWithAdmin = OrderPresenter & OrderAdmin;
export type OrderUpdate = {
  status: OrderStatus;
  state: OrderState;
  comment: string;
}

export const PurchaseOrderInputSchema = z.object({
  id: z.number().min(1).optional(),
  supplierId: z.number(),
  clubId: z.number().optional(),
  orderDate: z.date().optional(),
  paymentMode: z.nativeEnum(PaymentMode),
  deliveryDate: z.date().optional(),
  validationDate: z.date().optional(),
  remise: z.number().optional(),
  totalHT: z.number().min(0).optional(),
  valid: z.boolean().optional(),
  shippingFees: z.number().default(0).optional(),
  shippingVAT: z.number().default(20).optional(),
  paymentDelay: z.number().optional(),
  deposit: z.number().optional(),
  comment: z.string().optional(),
  status: z.nativeEnum(PurchaseOrderStatus).default(PurchaseOrderStatus.BROUILLON),
  createdAt: z.date()
});


export type PurchaseOrder = {
  id: number;
  supplierId: number;
  orderDate: Date;
  paymentMode: PaymentMode;
  clubId: number;
  deliveryDate: Date;
  validationDate: Date;
  remise: number;
  totalHT: number;
  valid: boolean;
  shippingFees: number;
  shippingVAT: number;
  paymentDelay: number;
  deposit: number;
  createdAt: Date;
  comment: string;
  status: PurchaseOrderStatus;
}

export const OrderInputSchema = z.object({
  clientNumber: z.number(),
  status: z.nativeEnum(OrderStatus),
  amount: z.number(),
  deliveryFees: z.number(),
  withoutVAT: z.boolean(),
  quotation: z.boolean(),
  deliveryMode: z.nativeEnum(OrderDeliveryMode),
  usedCredit: z.number(),
  totalDiscount: z.number(),
  authorisation: z.string(),
  paymentMode: z.string(),
  authorisationDate: z.string(),
});

export type OrderInput = z.infer<typeof OrderInputSchema>;

export const OrderAddressSchema = z.object({
  orderId: z.number(),
  type: z.nativeEnum(AddressType),
  relaisId: z.string().optional(),
  company: z.string().optional(),
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  address: z.string().optional(),
  address2: z.string().optional(),
  address3: z.string().optional(),
  postCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export type OrderAddress = {
  orderId: number;
  type: AddressType;
  relaisId: string;
  company: string;
  lastName: string;
  firstName: string;
  address: string;
  address2: string;
  address3: string;
  postCode: string;
  city: string;
  country: string;
}

export type OrderAddressInput = z.infer<typeof OrderAddressSchema>;

export type AdminOrder = {
  orderId: number;
  internalComment: string;
  etat: OrderEtat;
}
export type OrderSupplierLine = {
  id: number;
  quantity: number;
  receivedQuantity: number;
  unitPriceExclTax: number;
  vat: number;
  isValid: boolean;
  supplierOrderId?: number;  
  modelId?: number;          
  validationDate?: Date;    
  discount?: number;        
  comment?: string;
  totalPriceInclTax?: number; 
}

export type PurchaseOrderInput = Omit<PurchaseOrder, 'id' | 'createdAt'>;
export type PurchaseOrderInput2 = z.infer<typeof PurchaseOrderInputSchema>;

export const PurchaseOrderLineSchema = z.object({
  id: z.number().optional(),
  orderSupplierId: z.number(),
  orderDate: z.date().optional(),
  modelId: z.number(),
  validationDate: z.date().optional(),
  quantity: z.number(),
  receivedQuantity: z.number().optional(),
  unitHtPrice: z.number().optional(),
  discount: z.number().optional(),
  vat: z.number().optional(),
  valid: z.boolean().optional(),
  comment: z.string().optional(),
  ttcPrice: z.number().optional(),
});

export type PurchaseOrderLineInput = z.infer<typeof PurchaseOrderLineSchema>;

export type PurchaseOrderLine = {
  id: number;
  orderSupplierId: number;
  modelId: number;
  modelProduct?: ModelProductDetail;
  validationDate: Date;
  quantity: number;
  receivedQuantity: number;
  unitHtPrice: number;
  discount: number;
  vat: number;
  valid: boolean;
  comment: string;
  ttcPrice: number;
}

export type PurchaseOrderPresenter = PurchaseOrder & {
  supplier?: Supplier;
  expeditions?: ShippingDataForSupplierPresenter;
  lines: PurchaseOrderLine[];
}

export type PurchaseOrderPresenterInput = PurchaseOrderInput2 & {
  lines: PurchaseOrderLineInput[];
  expeditions?: ShippingDataForSupplierPresenterInput;
}

export enum PurchaseOrderFilterType {
  STATUS = "STATUS",
  MODE_PAIEMENT = "MODE_PAIEMENT",
  VALID = "VALID"
}

export const PurchaseOrderOptionsSchema = z.object({
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
});

export type PurchaseOrderFilterInput = z.input<typeof PurchaseOrderOptionsSchema>;