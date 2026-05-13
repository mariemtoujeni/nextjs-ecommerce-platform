"use server";

import { listSubCategoriesUseCase } from "@repo/core/usecases";
import { CategoryFilterInput } from "@repo/core/models";

export const getSubCategoriesAction = async (options?: CategoryFilterInput) => {
    try 
    {
        const subCategories = await listSubCategoriesUseCase(options);

        return subCategories;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
};
