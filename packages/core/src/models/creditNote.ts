import { z } from "zod"
import { OrderSchema } from "./Order";
import { Client } from "./Client";
// Modèle représentant un avoir (credit note) lié à un client

export type creditNote = {
  id: number;
  numero_client: number;
  id_commande: number;
  total: number;
  date_creation: Date;
  date_expiration: Date;
  utilise: boolean;
  type: string;
  montant_restant: number;
} 

export enum CreditNoteType {
    CASHBACK = 'CASHBACK',
    REMBOURSEMENT = 'REMBOURSEMENT'
}

export const CreditNoteOptionsSchema = z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional().default(''),
    filters: z.array(z.object({
        key: z.string(),
        values: z.union([z.array(z.string()), z.array(z.object({
            key: z.string(),
            values: z.array(z.string())
        }))])
    })).optional()
});

export type CreditNoteFilterInput = z.input<typeof CreditNoteOptionsSchema>;
export type CreditNoteFilter = z.infer<typeof CreditNoteOptionsSchema>;

export const CreditNoteLineSchema = z.object({
    creditNoteId: z.number(),
    modelId: z.number(),
    quantity: z.number(),
    priceExcludingTax: z.number(),
    vatRate: z.number(),
    label: z.string().optional(),
});

export type CreditNoteLine = z.infer<typeof CreditNoteLineSchema>;
export type CreditNoteLineInput = z.input<typeof CreditNoteLineSchema>;

export const CreditNoteSchema = z.object({
    id: z.number().optional(),
    clientId: z.number(),
    orderId: z.number(),
    total: z.number(),
    createdAt: z.date(),
    expiredAt: z.date().optional(),
    used: z.boolean().optional(),
    type: z.nativeEnum(CreditNoteType),
    remainingAmount: z.number().optional(),
    lines: z.array(CreditNoteLineSchema).optional(),
    order: OrderSchema.optional()
});

export type CreditNote = z.infer<typeof CreditNoteSchema>;
export type CreditNoteInput = z.input<typeof CreditNoteSchema>;

export type CreditNotePresenter = CreditNote & {
    client: Client;
}