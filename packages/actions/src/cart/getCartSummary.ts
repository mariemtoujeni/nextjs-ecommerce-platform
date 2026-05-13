"use server"

import { ReturnOne } from "@repo/core/types";
import { CartSummary, getCartSummaryUseCase } from "@repo/core/usecases";

export const getCartSummaryAction = async (): Promise<ReturnOne<CartSummary>> => {
    try {
        const cartSummary = await getCartSummaryUseCase();
        return {
            item: cartSummary,
        };
    } catch (error: any) {
        return {
            item: {} as CartSummary,
            error: error
        };
    }
}