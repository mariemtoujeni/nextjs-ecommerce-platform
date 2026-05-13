"use server"

import { Shop, ShopFilterInput } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listAllShopsUseCase } from "@repo/core/usecases";

export const getAllShopsAction = async (options?: ShopFilterInput) : Promise<ReturnAll<Shop>> => {
    try {
        const shops = await listAllShopsUseCase(false, options);
        return shops;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        } as ReturnAll<Shop>;
    }
}

