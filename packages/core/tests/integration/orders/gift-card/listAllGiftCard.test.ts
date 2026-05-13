import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listAllGiftCardsUseCase } from "../../../../src/usecases/orders/gift-card";
import { signInTestUser, TestUser } from "../../utils";

describe("listAllGiftCardsUseCase", () => {
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
    });

    afterAll(async () => {
    });

    it("should return all gift cards", async () => {
        const giftCards = await listAllGiftCardsUseCase();
        expect(giftCards.total).toBeGreaterThan(0);
        expect(giftCards.count).toBeGreaterThan(0);
        expect(giftCards.items).toBeDefined();
        expect(giftCards.items).toBeInstanceOf(Array);
    });

    it("should return all gift cards with search", async () => {
        const giftCards = await listAllGiftCardsUseCase({ search: "VIP1285857307BA" });
        expect(giftCards.count).toBe(1);
        expect(giftCards.items).toBeDefined();
        expect(giftCards.items).toBeInstanceOf(Array);
        expect(giftCards.items.length).toBe(1);
        expect(giftCards.items[0]?.code).toBe("VIP1285857307BA");
    });
});
