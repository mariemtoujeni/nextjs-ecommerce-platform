"use server"

import { Shop, ShopFilterInput } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listAllShopsUseCase } from "@repo/core/usecases";

export const listShopsAction = async (onlyActive: boolean = false, options?: ShopFilterInput) : Promise<ReturnAll<Shop>> => {
    try {
        const shops = await listAllShopsUseCase(onlyActive, options);
        return shops;
    } catch (error: any) {
        throw error;
    }
}