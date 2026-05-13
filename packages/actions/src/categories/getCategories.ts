"use server";

import { listCategoriesUseCase } from "@repo/core/usecases";
import { CategoryFilterInput } from "@repo/core/models";

export const getCategoriesAction = async (options?: CategoryFilterInput) => {
    try 
    {
        const categories = await listCategoriesUseCase(options);
        return categories;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
};
