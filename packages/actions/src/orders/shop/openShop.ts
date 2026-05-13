"use server"

import { Shop } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { openShopUseCase } from "@repo/core/usecases";
import { ShopPresenterWithModels } from "./getShop";

export const openShopAction = async (shop: ShopPresenterWithModels) : Promise<ReturnOne<Shop>> => {
    try {
        const createdShop = await openShopUseCase(shop);
        return createdShop;
    } catch (error: any) {
        return {
            item: {} as unknown as Shop,
            error: error.message,
        } as ReturnOne<Shop>;
    }
}