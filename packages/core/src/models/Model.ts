import { z } from "zod";
import { Product, Stock } from "./Product";
import { AttributValue } from "./Attributes";

export const modelOptionsSchema = z.object({
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

export type ModelFilterInput = z.input<typeof modelOptionsSchema>;
export type ModelFilter = z.infer<typeof modelOptionsSchema>;
export type ModelProductFilter = z.infer<typeof modelOptionsSchema>;

export type DeliverySchedule = {
    date: Date;
    quantity: number;
}

export type UpdateSupplierStock = {
    sku: string;
    barcode: string;
    stock: number;
    deliveries: DeliverySchedule[]
}

export type ModelAttributValue = {
    idModel: number;
    idAttributValue: number;
    attributValue: AttributValue;
}

export type Model = {
    id: number;
    productId: number;
    weight: number;
    priceWithoutVat: number;
    priceWithVat: number;
    published: boolean;
    minStock: number;
    attributValeurs?: AttributValue[];
    attributValues: ModelAttributValue[];
}

export type ModelAdmin = Model & {
    purchasePrice: number;
    barcode: string;
    supplierReference: string;
    manufacturerReference: string;
}

export type ModelWithProduct = ModelAdmin & {
    product: Product;
    stock?: Stock;
}

export type ReadAllModelsWithProductProps = {
    options: ModelFilterInput;
    modelIds?: number[];
    brandId?: number;
    flag?: 'purchase-order' | 'other';
}

export type ModelUpdate = Omit<ModelAdmin, "productId" | "product" | "attributValeurs" | "attributValues" | "id" >

export type ModelStockUpdate = {
    modelId: number;
    quantity: number;
};
