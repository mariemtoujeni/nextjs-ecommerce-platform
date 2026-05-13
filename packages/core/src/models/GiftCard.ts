import { z } from "zod";
import { Client } from "./Client";

export const giftCardOptionsSchema = z.object({
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

export type GiftCardFilterInput = z.input<typeof giftCardOptionsSchema>;
export type GiftCardFilter = z.infer<typeof giftCardOptionsSchema>;

export enum GiftCardFilterType {
    STATUS = "STATUS"
}

export enum GiftCardStatus {
    USED = 'USED',
    NOT_USED = 'NOT_USED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export const  gitCardSchema = z.object({
    id: z.number().optional(),
    value: z.number(),
    code: z.string().optional(),
    expirationDate: z.date().optional(),
    usedAt: z.date().optional(),
    used: z.boolean().optional(),
    remainingValue: z.number().optional(),
    clientId: z.number(),
    commandId: z.number().optional(),
    cancelled: z.number().optional()
});

export type GiftCard = z.infer<typeof gitCardSchema>;
export type GiftCardInput = z.input<typeof gitCardSchema>;

export type GiftCardPresenter = GiftCard & {
    client: Client;
    usedBy: Client;
}

