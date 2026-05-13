import { z } from "zod";
import { Product } from "./Product";

export type Collection = {
    id: number;
    name: string;
    active: number;
}

export const collectionSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1),
    active: z.number().optional().default(1),
})

export type CollectionInput = z.input<typeof collectionSchema>;

export type CollectionProduct = {    
    collectionId: number;
    productId: number;
    product?: Product;
    createdAt?: Date;
}

export const collectionOptionsSchema = z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
})

export type CollectionFilterInput = z.input<typeof collectionOptionsSchema>;
export type CollectionFilter = z.infer<typeof collectionOptionsSchema>;