import { z } from "zod";
import { Client } from "./Client";
import { ShopPresenter } from "./Shop";
import { ProductImage } from "./Product";
import { ModelAttributValue } from "./Model";

export const checkoutOptionsSchema = z.object({
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

export type CheckoutFilterInput = z.input<typeof checkoutOptionsSchema>;
export type CheckoutFilter = z.infer<typeof checkoutOptionsSchema>;


export enum CheckoutFilterType {
    PAYMENT_METHOD = "PAYMENT_METHOD",
    DISCOUNT_TYPE = "DISCOUNT_TYPE",
    STATUS = "STATUS",
}

export enum PaymentMethod {
    CASH = 'CASH',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    TRANSFER = 'TRANSFER',
    CHECK = 'CHECK',
    OTHER = 'OTHER',
}

export enum DiscountType {
    PERCENTAGE = 'POURCENTAGE',
    FIXED = 'MONTANT',
}

export enum CheckoutStatus {
    OPEN = 'ACTIF',
    CLOSED = 'FINALISE'
}

export type Checkout = {
    id: number;
    idClient: number;
    idShop: number;
    paymentMethod: PaymentMethod;
    discountType: DiscountType;
    discountAmount: string;
    totalHT: string;
    totalTTC: string;
    cbAmount: string;
    cashAmount: string;
    checkAmount: string;
    NoVAT: boolean;
    VAT?: number;
    status: CheckoutStatus;
    createdAt: Date;
}

export type ModelProductDetail = {
    name: string;
    attributs: string[];
    price: number;
    image: string;
    codeBar?: string;
    supplierReference?: string;
    manufacturerReference?: string;
    storeNames?: string[];
    stock?: number;
    minStock?: number;
    img?: ProductImage[];
    attributValues?: ModelAttributValue[];
}

export type CheckoutLine = {
    id: number;
    idCheckout: number;
    idModel: number;
    modelProduct?: ModelProductDetail;
    name: string;
    codeBar: string;
    price: number;
    quantity: number;
    discount: string;
    VAT: number;
    comment: string;
    discountType: DiscountType;
}

export type CheckoutPresenter = Checkout & {
    lines?: CheckoutLine[];
    shop: ShopPresenter;
    client: Client;
}

export type CreateCheckout = Omit<Checkout, 'id' | 'createdAt'>;
export type CreateCheckoutLineRequest = Omit<CheckoutLine, 'id' | 'idCheckout'>;
export type CreateCheckoutRequest = Omit<CheckoutPresenter, 'id' | 'createdAt' | 'lines'> & {
    lines: CreateCheckoutLineRequest[];
};

export const checkoutInputSchema = z.object({
    idClient: z.number(),
    idShop: z.number(),
    paymentMethod: z.nativeEnum(PaymentMethod),
    discountType: z.nativeEnum(DiscountType).optional(),
    discountAmount: z.string().optional(),
    totalHT: z.string(),
    totalTTC: z.string(),
    status: z.nativeEnum(CheckoutStatus).optional(),
    cbAmount: z.string().optional(),
    cashAmount: z.string().optional(),
    checkAmount: z.string().optional(),
    NoVAT: z.boolean().optional(),
    createdAt: z.string().optional(),
    lines: z.array(z.object({
        idModel: z.number(),
        quantity: z.number(),
        discount: z.string().optional(),
        discountType: z.nativeEnum(DiscountType).optional(),
    })).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export const checkoutLineInputSchema = z.object({
    idModel: z.number(),
    quantity: z.number(),
    discount: z.string().optional(),
    discountType: z.nativeEnum(DiscountType).optional(),
});

export type CheckoutLineInput = z.infer<typeof checkoutLineInputSchema>;