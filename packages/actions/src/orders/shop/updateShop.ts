"use server"

import { ReturnOne } from "@repo/core/types";
import { ShopPresenterWithModels } from "./getShop";
import { updateShopLineUseCase, updateShopUseCase } from "@repo/core/usecases";
import { Department, ShopLine } from "@repo/core/models";

export const updateShopAction = async (shop: ShopPresenterWithModels) : Promise<ReturnOne<ShopPresenterWithModels>> => {
    try{
        const updatedShop = await updateShopUseCase(shop.id, {
            name: shop.name,
            expirationDate: shop.expirationDate ? new Date(shop.expirationDate).toISOString() : undefined,
            isActive: shop.isActive,
            status: shop.status,
            department: shop.department as Department
        });

        let updatedShopLine: ShopLine[] = [];
        if(shop.lines && shop.lines.length > 0) {
            updatedShopLine = await updateShopLineUseCase(shop.lines);
        }

        return {
            item: {
                ...updatedShop,
                lines: updatedShopLine.map((line, index) => ({
                    ...line,
                    model: {
                        name: shop.lines[index]?.model?.name ?? ''  ,
                        attributs: shop.lines[index]?.model?.attributs ?? [],
                        price: shop.lines[index]?.model?.price ?? 0,
                        image: shop.lines[index]?.model?.image ?? ''
                    }
                }))
            }
        };
    } catch(error: any) {
        return {
            item: {} as ShopPresenterWithModels,
            error: error.message,
        }        
    }
}