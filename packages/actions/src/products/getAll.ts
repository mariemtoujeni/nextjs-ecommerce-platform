'use server';
import { FilterAttributeInput, ProductFilterInput, ProductWithAdmin } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listAllProductsUseCase } from "@repo/core/usecases";

export const getAllProductAction = async (options?: ProductFilterInput, optionsFilterAttribute?: FilterAttributeInput[]) : Promise<ReturnAll<ProductWithAdmin>> => {
    try 
    {
        const products = await listAllProductsUseCase(options, optionsFilterAttribute);
        return products;
    } catch (error: any) {
        return {
            total: 0,
            items: [] as ProductWithAdmin[],
            count: 0,
            error: error.message,
        } as ReturnAll<ProductWithAdmin>;
    }
}