import { z } from "zod";
import { ProductDescription, ProductImage, Stock } from "./Product";
import { Model } from "./Model";
import { Client } from "./Client";

export const productAlertOptionsSchema = z.object({
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

export type ProductAlertFilterInput = z.input<typeof productAlertOptionsSchema>;
export type ProductAlertFilter = z.infer<typeof productAlertOptionsSchema>;
export enum ProductAlertFilterTypeAdmin {
    STATE = "STATE",
}

export type ClientDetail = Pick<Client, 'firstName' | 'lastName' | 'email' | 'userId'>;

export type CreateAlertInput = {  
  idModel: number;
  email?: string;
  clientNumber?: number;
}
export type InsertedProductAlert = {
  idModel: number;
  email: string;
  clientNumber?: number | null;
  createdAt: Date;
  isActif: boolean;
  isEmailSent: boolean;
}


export type ProductAlert = {
  id: number;
  clientNumber?: number;
  client: ClientDetail;
  idModel: number;
  model: ModelWithProductDetail;
  email: string;
  createdAt: Date;
  isActif: boolean;
  isEmailSent: boolean;
}

export type ModelWithProductDetail = Model & {
  productDetails: {
    descriptions: ProductDescription[];
    images: ProductImage[];
  };
  stock?: Stock;
};
