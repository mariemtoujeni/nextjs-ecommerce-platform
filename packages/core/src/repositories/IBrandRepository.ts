import { Brand, categoryOptionsSchema } from "../models";
import { ReturnAll } from "../types";
import { z } from "zod";


export const brandOptionsSchema = z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    sort: z.enum(['asc', 'desc', 'asc_name', 'desc_name']).optional().default('desc'),
})

export type BrandFilterInput = z.input<typeof brandOptionsSchema>;
export type BrandFilter = z.infer<typeof brandOptionsSchema>;

export interface IBrandRepository {
    readAll(options: BrandFilter): Promise<ReturnAll<Brand>>;
}