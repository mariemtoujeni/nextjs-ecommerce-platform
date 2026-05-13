"use server"

import { listCartItemsUseCase } from "@repo/core/usecases";
import { Cart } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";

export const getCartAction = async (): Promise<ReturnAll<Cart>> => {
    try {
        const cart = await listCartItemsUseCase();
        return {
            items: cart,
            total: cart.length,
            count: cart.length
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