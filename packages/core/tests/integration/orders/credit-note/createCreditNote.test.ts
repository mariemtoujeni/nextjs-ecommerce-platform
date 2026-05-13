import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createCreditNoteUseCase } from "../../../../src/usecases/orders/credit-note";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection, InternalServerError } from "../../../../src/types";
import { CreditNoteInput, CreditNoteType } from "../../../../src/models";

describe("createCreditNoteUseCase", () => {
    let supabase: SupabaseClient;
    let creditNoteId: number;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
        await supabase.from("avoirs").delete().eq("id", creditNoteId);
    });

    it("should create a credit note", async () => {
        const creditNoteInput : CreditNoteInput = {
            clientId: 22992,
            orderId: 203587,
            total: 200.32,
            createdAt: new Date(),
            expiredAt: new Date(new Date().setDate(new Date().getDate() + 30)),
            used: false,
            type: CreditNoteType.CASHBACK,
            remainingAmount: 0
        }


        const creditNote = await createCreditNoteUseCase(creditNoteInput);
        creditNoteId = creditNote.item?.id || 0;

        expect(creditNote).toBeDefined();
        expect(creditNote.item?.id).toBe(creditNoteId);
        expect(creditNote.item?.total).toBe(200.32);
        expect(creditNote.item?.createdAt).toBeDefined();
        expect(creditNote.item?.expiredAt).toBeDefined();
        expect(creditNote.item?.used).toBe(false);
        expect(creditNote.item?.type).toBe(CreditNoteType.CASHBACK);
        expect(creditNote.item?.remainingAmount).toBe(0);
    });
});