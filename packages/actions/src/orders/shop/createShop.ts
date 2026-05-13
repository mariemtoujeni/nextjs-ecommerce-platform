"use server"

import { ShopPresenterInput } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { ShopPresenterWithModels } from "./getShop";
import { createShopWhithShopLinesUseCase } from "@repo/core/usecases";

export const createShopAction = async (shop: ShopPresenterInput) : Promise<ReturnOne<ShopPresenterWithModels>> => {
    try {
        const createdShop = await createShopWhithShopLinesUseCase(shop);
        return createdShop;
    }  catch(error: any) {
        return {
            item: {} as ShopPresenterWithModels,
            error: error.message,
        }
    }
}