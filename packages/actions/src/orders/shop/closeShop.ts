"use server"

import { Shop, ShopPresenter } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { closeShopUseCase } from "@repo/core/usecases";

export const closeShopAction = async (shopToClose : ShopPresenter) : Promise<ReturnOne<Shop>> => {
    try {        
        const shop = await closeShopUseCase(shopToClose);
        return shop;
    } catch (error: any) {
        return {
            item: {} as unknown as Shop,
            error: error.message,
        } as ReturnOne<Shop>;
    }
}