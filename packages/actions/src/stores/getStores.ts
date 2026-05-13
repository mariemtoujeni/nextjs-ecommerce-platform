"use server";

import { listStoresUseCase } from "@repo/core/usecases";
import { CategoryFilterInput } from "@repo/core/models";

export const getStoresAction = async (options?: CategoryFilterInput) => {
    try 
    {
        const stores = await listStoresUseCase(options);

        return stores;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
};
