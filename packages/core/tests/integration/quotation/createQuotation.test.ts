import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createQuotationUseCase } from "@repo/core/usecases";
import { QuotationInput, QuotationStatus } from "@repo/core/models";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";


describe("addQuotationUseCase", () => {
    let supabase: SupabaseClient;
    let quotationId: number;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
        await supabase.from("devis").delete().eq("id", quotationId);
    });

    it("should add a quotation", async () => {
        const sampleQuotationInput: QuotationInput = {
            title: "Quotation title",
            status: QuotationStatus.EN_ATTENTE, 
            totalAmount: 1500.00,
            shippingFees: 50.00,
            withoutTVA: false,
            totalDiscount: 100.00,
            clientComment: "Please deliver before end of the month.",
            usedCredit: 0,
            version: 1,
        };

        const quotation = await createQuotationUseCase(sampleQuotationInput);
        quotationId = quotation.id;
        
        expect(quotation.title).toBe(sampleQuotationInput.title);
        expect(quotation.status).toBe(sampleQuotationInput.status);
        expect(quotation.totalAmount).toBe(sampleQuotationInput.totalAmount);
        expect(quotation.shippingFees).toBe(sampleQuotationInput.shippingFees);
        expect(quotation.withoutTVA).toBe(sampleQuotationInput.withoutTVA);
        expect(quotation.totalDiscount).toBe(sampleQuotationInput.totalDiscount);
        expect(quotation.clientComment).toBe(sampleQuotationInput.clientComment);
        expect(quotation.usedCredit).toBe(sampleQuotationInput.usedCredit);
        expect(quotation.version).toBe(sampleQuotationInput.version);
    });
});

