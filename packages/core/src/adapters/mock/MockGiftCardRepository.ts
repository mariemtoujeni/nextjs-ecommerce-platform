import { IGiftCardRepository } from "../../repositories";
import { GiftCard, GiftCardFilter, GiftCardInput, GiftCardPresenter } from "../../models";
import { ReturnAll } from "../../types";
import { SharedMemory } from "./SharedMemory";

export class MockGiftCardRepository implements IGiftCardRepository {
    read(orderIds: number[]): Promise<GiftCard[]> {
       /* const giftVouchers = SharedMemory.giftVouchers.filter(giftVoucher => orderIds.includes(giftVoucher.commandID));
     return Promise.resolve(giftVouchers);*/
      throw new Error("Not implemented");
    }
    async listAll(options?: GiftCardFilter): Promise<ReturnAll<GiftCardPresenter>> {
        throw new Error("Not implemented");
    }

    async create(giftCard: GiftCardInput): Promise<GiftCard> {
        throw new Error("Not implemented");
    }

    async update(giftCard: GiftCardInput): Promise<GiftCard> {
        throw new Error("Not implemented");
    }

    async delete(id: number): Promise<void> {
        throw new Error("Not implemented");
    }
}