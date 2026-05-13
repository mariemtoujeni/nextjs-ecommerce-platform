import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { archiveGiftCardUseCase } from "../../../../src/usecases/orders/gift-card";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";

describe("archiveGiftCardUseCase", () => {
    let giftCardId: number;
    let supabase: SupabaseClient;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");

        const giftCard = {
            code: "TEST1234567890",
            montant: 100,
            date_fin: new Date().toISOString(),
            numero_client: 1,
            used: false,
            montant_restant: 100
        }

        const { data: giftCardData, error: giftCardError } = await supabase.from("cheque_cadeau").insert(giftCard).select().single();
        if (giftCardError) throw giftCardError;
        giftCardId = giftCardData.id;
    });

    afterAll(async () => {
        const { error: deleteError } = await supabase.from("cheque_cadeau").delete().eq("id", giftCardId);
        if (deleteError) throw deleteError;
    });

    it("should archive a gift card", async () => {
        const giftCard = await archiveGiftCardUseCase({ id: giftCardId, cancelled: 0, value: 100, clientId: 1, used: false, remainingValue: 100 });
        expect(giftCard.id).toBe(giftCardId);
        expect(giftCard.value).toBe(100);
        expect(giftCard.clientId).toBe(1);
        expect(giftCard.used).toBe(false);
        expect(giftCard.remainingValue).toBe(100);
        expect(giftCard.code).toBe("TEST1234567890");
        expect(giftCard.cancelled).toBe(1);
    });
});
