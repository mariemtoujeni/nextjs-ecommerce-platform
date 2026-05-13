import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getCreditNoteByCommandIdUseCase } from "../../../../src/usecases/orders/credit-note";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection, InternalServerError, NotFoundError } from "../../../../src/types";
import { CreditNoteType } from "../../../../src/models";

describe("getCreditNoteByCommandIdUseCase", () => {
    let supabase: SupabaseClient;
    const commandeId: number = 203587;
    let creditNoteId: number;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");

        // delete all credit notes for the command
        await supabase.from("avoirs").delete().eq("id_commande", commandeId);

        const creditNote = {
            numero_client: 22992,
            id_commande: commandeId,
            total: 200.32,
            date_creation: new Date().toISOString(),
            date_expiration: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
            utilise: false,
            type: CreditNoteType.CASHBACK,
            montant_restant: 0
        }

        const { data: creditNoteData, error: creditNoteError } = await supabase.from("avoirs").insert(creditNote).select().single();
        if (creditNoteError) throw creditNoteError;
        creditNoteId = creditNoteData.id;
        
    });

    afterAll(async () => {
        await supabase.from("avoirs").delete().eq("id", creditNoteId);
    });

    it("should get a credit note by command id", async () => {
        const creditNote = await getCreditNoteByCommandIdUseCase(commandeId);        
        expect(creditNote).toBeDefined();
        expect(creditNote.item?.id).toBe(creditNoteId);
        expect(creditNote.item?.total).toBe(200.32);
        expect(creditNote.item?.createdAt).toBeDefined();
        expect(creditNote.item?.expiredAt).toBeDefined();
        expect(creditNote.item?.used).toBe(false);
        expect(creditNote.item?.type).toBe(CreditNoteType.CASHBACK);
        expect(creditNote.item?.remainingAmount).toBe(0);
    });

    it("should return an error if the command id is not found", async () => {
        await expect(getCreditNoteByCommandIdUseCase(999999)).rejects.toThrow(NotFoundError);
    });

});