"use server"

import { getDiscountCartUseCase } from "@repo/core/usecases";
import { DiscountCart } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";

export const getDiscountCartAction = async (): Promise<ReturnAll<DiscountCart>> => {
    try {
        const discountCart = await getDiscountCartUseCase();
        return {
            items: discountCart,
            total: discountCart.length,
            count: discountCart.length
        };
    } catch (error: any) {
        return {
            items: [],
            total: 0,
            count: 0,
            error: error            
        };
    }
}