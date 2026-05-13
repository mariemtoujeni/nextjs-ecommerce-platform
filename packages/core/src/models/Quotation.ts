import { z } from "zod";
import { Club } from "./Club";
import { DiscountType, ModelProductDetail } from "./Checkout";
import { Client } from "./Client";
import { Order } from "./Order";

export const quotationOptionsSchema = z.object({
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

export type QuotationFilterInput = z.input<typeof quotationOptionsSchema>;
export type QuotationFilter = z.infer<typeof quotationOptionsSchema>;

export enum QuotationStatus {
    EN_ATTENTE = 'EN_ATTENTE',
    VALIDE = 'VALIDE',
    ARCHIVE = 'ARCHIVE',
}

export enum OrderDeliveryMode {
    COLISSIMO = 'COLISSIMO',
    NON_LIVRABLE = 'NON_LIVRABLE',
    MANUEL = 'MANUEL',
    EXPEDITOR = 'EXPEDITOR',
    MONDIAL_RELAIS = 'MONDIAL_RELAIS',
    EXAPAQ = 'EXAPAQ',
    ICI_RELAIS = 'ICI_RELAIS',
    CHRONOPOST = 'CHRONOPOST',
    CHRONOPOST_RELAIS = 'CHRONOPOST_RELAIS',
    AU_MAGASIN = 'AU_MAGASIN',
    AU_CLUB = 'AU_CLUB',
    SO_COLISSIMO = 'SO_COLISSIMO',
    MONDIAL_RELAY = 'MONDIAL_RELAY',
}

export enum QuotationDiscountType {
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

export enum QuotationFilterTypeAdmin {
    STATE = "STATE",
}

export type Quotation = {
    id: number;
    title: string;
    orderId: number;
    order?: Order;
    products?: ModelProductInfo[];
    clubId: number;
    club?: Club;  
    status: QuotationStatus;
    totalAmount: number;
    shippingFees: number;
    rest: number;
    withoutTVA: boolean;
    totalDiscount: number;
    clientComment: string;
    usedCredit: number;
    version: number;
    clientNumber: number;
    client?: Client;
    createdAt: Date;
    deliveryMode: OrderDeliveryMode;  
}

export type ModelProductInfo = ModelProductDetail & {
    weight: number;
}

export type QuotationLine = {
    id: number;
    quotationId: number;
    modelId: number;
    modelProduct?: ModelProductInfo;
    discountType: QuotationDiscountType;
    discountValueType: DiscountType; 
    barcode: string;
    manufacturerReference: string;
    quantity: number;
    unitPriceExcludingTax: number;
    tva: number;
    totalPriceExcludingTax: number;
    totalPriceIncludingTax: number;
    giftVoucher: boolean;
    checkDuration: number;
    weight: number;
    comment: string;
    discountValue: number;
    discountInfo: string;
    available: boolean;
    createdAt: Date;
}

export type QuotationDiscount = {
    id: number;
    quotationId: number;
    valueType: DiscountType;
    discountId: number;
    value: number;
    info: string;
    date: Date;
    type: QuotationDiscountType;
}

export type QuotationInput = {
    title: string;
    status: QuotationStatus;
    totalAmount: number;
    shippingFees: number;
    withoutTVA: boolean;
    totalDiscount: number;
    clientComment: string;
    usedCredit: number;
    version: number;
}

export type QuotationLineInput = Omit<QuotationLine, 'id' | 'createdAt'>;
export type QuotationDiscountInput = Omit<QuotationDiscount, 'id' | 'date'>;


export type QuotationPresenter = Quotation & {
    lines?: QuotationLine[];
    client?: Client;
}

export type CreateQuotation = Omit<Quotation, 'id' | 'createdAt'>;
export type CreateQuotationLineRequest = QuotationLineInput;
export type CreateQuotationRequest = Omit<QuotationPresenter, 'id' | 'createdAt' | 'lines'> & {
    lines: CreateQuotationLineRequest[];
};
