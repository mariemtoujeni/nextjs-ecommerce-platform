import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { deleteGiftCardUseCase } from "../../../../src/usecases/orders/gift-card";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";

describe("deleteGiftCardUseCase", () => {
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

    it("should delete a gift card", async () => {
        await deleteGiftCardUseCase(giftCardId);
        
        const { data: giftCardData, error: giftCardError } = await supabase.from("cheque_cadeau").select("*").eq("id", giftCardId).single();
        expect(giftCardData).toBeNull();
    });
});