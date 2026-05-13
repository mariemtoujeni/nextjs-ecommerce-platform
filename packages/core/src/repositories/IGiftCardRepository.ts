import { ReturnAll } from "../types";
import { GiftCard, GiftCardFilter, GiftCardInput, GiftCardPresenter } from "../models";

export interface IGiftCardRepository {
    listAll(options?: GiftCardFilter): Promise<ReturnAll<GiftCardPresenter>>;
    create(giftCard: GiftCardInput): Promise<GiftCard>;
    update(giftCard: GiftCardInput): Promise<GiftCard>;
    delete(id: number): Promise<void>;
    read(orderIds: number[]): Promise<GiftCard[]>;
}