"use server"

import { GiftCardFilterInput, GiftCardPresenter } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listAllGiftCardsUseCase } from "@repo/core/usecases";

export const listGiftCardsAction = async (options?: GiftCardFilterInput): Promise<ReturnAll<GiftCardPresenter>> => {
    try {
        const giftCards = await listAllGiftCardsUseCase(options);
        return giftCards;
    }
    catch (error: any) {
        return {
            items: [] as unknown as GiftCardPresenter[],
            total: 0,
            count: 0,
            error: error.message,
        };
    }
}