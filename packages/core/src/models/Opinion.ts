import { Client } from "./Client";
import { Product } from "./Product";
import { z } from "zod";

export const opinionOptionsSchema = z.object({
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
export type OpinionFilterInput = z.input<typeof opinionOptionsSchema>;
export type OpinionFilter = z.infer<typeof opinionOptionsSchema>;

export type OpinionFilterTypeAdmin = 'validated'| 'actif'|'createdAt';
export type ProductDescriptions = {
    productId?: number;
    title: string;    
    description: string;
}
export type ProductImages = {
    productId?: number;
    url: string;
    
}
export type ClientInfo = Pick<Client, 'userId'|'email'|'firstName'|'lastName'|'phone'|'mobilePhone'|'clientNumber'>;
export type ProductInfo = Pick <Product,'id'>

export type Opinion={
    id: number | undefined;
    productId: number;   
    product : ProductInfo, 
    userId: number; 
    client: ClientInfo;   
    pseudo: string;
    email: string;
    title: string;
    text: string;
    rating: number;
    createdAt: Date;
    modelId: number;
    commandId: number;
    responseAdmin: string;
    validated: boolean;
    actif: boolean;
    descriptions: ProductDescriptions[];
    images: ProductImages[];  
    
}
export const opinionInputSchema=z.object({    
    modelId: z.number(),
    commandId: z.number(),
    productId: z.number(),
    title: z.string(),
    text: z.string(),
    rating: z.number(),
    createdAt: z.date(),
    
})
export type opinionInput = z.infer<typeof opinionInputSchema>;