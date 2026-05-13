import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createGiftCardUseCase } from "../../../../src/usecases/orders/gift-card";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";

describe("createGiftCardUseCase", () => {
    let giftCardId: number;
    let supabase: SupabaseClient;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
        const { error } = await supabase.from("cheque_cadeau").delete().eq("id", giftCardId);
        if (error) {
            console.error("CREATE GIFT CARD -> Error deleting gift card: ", error);
        }
    });

    it("should create a gift card", async () => {
        const giftCard = await createGiftCardUseCase({
            code: "TEST1234567890",
            value: 100,
            expirationDate: new Date(),
            clientId: 1
        });
        giftCardId = giftCard.item?.id ?? 0;
        expect(giftCard.item).toBeDefined();
        expect(giftCard.item?.code).toBe("TEST1234567890");
        expect(giftCard.item?.value).toBe(100);
    });
});