import { z } from "zod";
import { ModelProductDetail } from "./Checkout";


export const inventoryOptionsSchema = z.object({
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

export type InventoryFilterInput = z.input<typeof inventoryOptionsSchema>;
export type InventoryFilter = z.infer<typeof inventoryOptionsSchema>;

export enum InventoryFilterTypeAdmin {
    STATE = 'STATE'
}

export enum InventoryStatus {
    EN_ATTENTE = 'EN_ATTENTE',
    VALIDE = 'VALIDE',
    ARCHIVE = 'ARCHIVE',
}

export type Inventory = {
    id: number;
    name: string;
    valorisation: string; 
    createdAt?: string;
    status: InventoryStatus | null;
}

export type InventoryLine = {
    inventoryId: number;
    modelId: number;
    quantity: number;
    purchasePriceHT: number;
    model?: ModelProductDetail;
}

export type InventoryInput = {
    name: string;
    valorisation: string; 
    createdAt: string;
    status: InventoryStatus;
}
