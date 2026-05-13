"use server"

import { deleteGiftCardUseCase } from "@repo/core/usecases";
import { ReturnOne } from "@repo/core/types";

export const deleteGiftCardAction = async (giftCardId: number): Promise<ReturnOne<void>> => {
    try {
        await deleteGiftCardUseCase(giftCardId);
        return {
            item: null as unknown as void,
            error: undefined
        }
    } catch (error: any) {
        return {
            item: null as unknown as void,
            error: error.message
        }
    }
}