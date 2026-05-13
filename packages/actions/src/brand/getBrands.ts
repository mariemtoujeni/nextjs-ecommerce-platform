"use server";
import { Brand } from "@repo/core/models";
import { BrandFilterInput } from "@repo/core/repositories";
import { listAllBrandsUseCase } from "@repo/core/usecases";

export const getBrandsAction = async (options: BrandFilterInput) => {
    try {
        const brands = await listAllBrandsUseCase(options);
        return brands;
    } catch (error: any) {
        console.error(error);
        return {
            total: 0,
            items: [] as Brand[],
            count: 0,
            error: error.message,
        }
    }
}