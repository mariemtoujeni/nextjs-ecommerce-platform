import { z } from "zod";

export const SupplierOptionsSchema = z.object({
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
export type SupplierFilterInput = z.input<typeof SupplierOptionsSchema>;
export type SupplierFilter = z.infer<typeof SupplierOptionsSchema>;

export const SupplierInputSchema = z.object({
    code: z.string().optional(),
    name: z.string().min(1),
    address: z.string().min(1).optional(),
    zipCode: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional(),
    siret: z.string().min(1).optional(),
});
export type SupplierInput = z.infer<typeof SupplierInputSchema>;

export type Supplier = {
    id: number;
    code: string;
    name: string;
    address: string;
    zipCode: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    siret: string;
}