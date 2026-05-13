"use server"

import { ShopLine, ShopPresenterInput } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { ShopPresenterWithModels } from "./getShop";
import { duplicateShopUseCase } from "@repo/core/usecases";

export const duplicateShopAction = async (shop: ShopPresenterInput) : Promise<ReturnOne<ShopPresenterWithModels>> => {
    try {
        const duplicatedShop = await duplicateShopUseCase(shop);
        return duplicatedShop;
    } catch (error: any) {
        console.log(">>>>>>>>>> error:", error);
        return {
            item: {} as ShopPresenterWithModels,
            error: error.message,
        }
    }
}