import { z } from "zod";
import { Client } from "./Client";

export enum ShippingStatus {
    PENDING = "EN_PREPARATION",
    WAITING = "EN_ATTENTE",
    SHIPPED = "EXPEDIE"
}

export enum ShippingType {
    COLISSIMO = "Colissimo",
    CHRONOPOST = "Chronopost",
    EXPEDITOR = "Expeditor",
    MONDIAL_RELAY = "Mondial Relay",
    EXAPAQ = "Exapaq",
    ICI_RELAIS = "Ici Relais",
    SO_COLISSIMO = "So Colissimo",
    LETTRE_MAX = "Lettre Max",
    ACCESS_F = "AccessF",
    EMPTY = ""
}

export type ShippingAddress = {
    idRelais?: string;
    companyName?: string;
    firstName: string;
    lastName: string;
    address: string;
    address2: string;
    address3: string;
    postalCode: string;
    city: string;
    country: string;
    phone: string;
    mobile: string;
    email: string;
}

export type ShippingData = {
    orderId: number;
    clientNumber: number;
    client?: Client;
    weight: number;
    shippingFee?: number;
    totalPrice?: number;
    shippingAddress: ShippingAddress;
    billingAddress: ShippingAddress;
}

export type ShippingLabelResult = {
    result: boolean;
    trackingNumber: string;
    label?: Uint8Array;
}

export const ShippingDataSchema = z.object({
    id: z.number().min(1).optional(),
    orderId: z.number().min(1).optional(),
    purchaseOrderId: z.number().min(1).optional(),
    type: z.nativeEnum(ShippingType).optional(),
    createdAt: z.date(),
    expeditionDate: z.date().optional(),
    expectedDate: z.date().optional(),
    weight: z.number().min(0).optional(),
    trackingNumber: z.string().optional(),
    status: z.nativeEnum(ShippingStatus).optional(),
    etiquette: z.string().optional()
});

export type ShippingDataForSupplier = z.infer<typeof ShippingDataSchema>;
export type ShippingDataForSupplierInput = z.input<typeof ShippingDataSchema>;

export const ShippingDataLineSchema = z.object({
    id: z.number().min(1).optional(),
    expeditionId: z.number().min(1),
    modelId: z.number().min(1),
    checkoutQuantity: z.number().min(1),
    quantity: z.number().min(1)
});

export type ShippingDataForSupplierLine = z.infer<typeof ShippingDataLineSchema>;
export type ShippingDataForSupplierLineInput = z.input<typeof ShippingDataLineSchema>;

export type ShippingDataForSupplierPresenter = ShippingDataForSupplier & {
    lines: ShippingDataForSupplierLine[];
}

export type ShippingDataForSupplierPresenterInput = ShippingDataForSupplierInput & {
    lines: ShippingDataForSupplierLineInput[];
}

  