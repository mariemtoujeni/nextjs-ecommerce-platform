"use server"

import { ModelFilterInput, ModelWithProduct } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listShopModelProductsUseCase } from "@repo/core/usecases";

export const getShopModelProductsAction = async (shopId: number, options?: ModelFilterInput) : Promise<ReturnAll<ModelWithProduct>> => {
    try {
        const productModels = await listShopModelProductsUseCase(shopId, options);
        return productModels;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        } as ReturnAll<ModelWithProduct>;
    }
}
