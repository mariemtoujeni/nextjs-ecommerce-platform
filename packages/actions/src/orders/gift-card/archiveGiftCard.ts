'use server';

import { GiftCard, GiftCardInput } from "@repo/core/models";
import { GenericFilter, ReturnOne } from "@repo/core/types";
import { archiveGiftCardUseCase } from "@repo/core/usecases";

export const archiveGiftCardAction = async (giftCardToUpdate: GiftCardInput): Promise<ReturnOne<GiftCard>> => {
    try {
        const giftCard = await archiveGiftCardUseCase(giftCardToUpdate);
        return {
            item: giftCard,
            error: undefined
        }
    } catch (error) {
        console.error(error);
        return {
            item: null as unknown as GiftCard,
            error: (error as Error).message
        }
    }
}