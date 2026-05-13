import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPurchaseOrderUseCase } from "@repo/core/usecases";
import { PaymentMode, PurchaseOrderInput, PurchaseOrderStatus } from "@repo/core/models";
import { signInTestUser, TestUser } from "../../utils";
import { getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";


describe("addPurchaseOrderUseCase", () => {
    let supabase: SupabaseClient;
    let purchaseOrderId: number;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
        const { error } = await supabase.from("commandes_fournisseur").delete().eq("id", purchaseOrderId);
        if (error) {
            console.error("CREATE PURCHASE ORDER -> Error deleting purchase order -> delete purchase order: ", error, "| purchaseOrderId: ", purchaseOrderId);
        }
    });

    it("should add a purchase order", async () => {
        const samplePurchaseOrderInput: PurchaseOrderInput = {
            supplierId: 5,
            orderDate: new Date(),
            paymentMode: PaymentMode.CHEQUE,
            clubId: 0,
            deliveryDate: new Date(),
            validationDate: new Date(),
            remise: 5,
            totalHT: 30,
            valid: false,
            shippingFees: 10,
            shippingVAT: 20,
            paymentDelay: 3,
            deposit: 9,
            comment: "test",
            status: PurchaseOrderStatus.BROUILLON
        };

        const purchaseOrder = await createPurchaseOrderUseCase(samplePurchaseOrderInput);
        purchaseOrderId = purchaseOrder.id;
        
        expect(purchaseOrder.paymentMode).toBe(samplePurchaseOrderInput.paymentMode);
        expect(purchaseOrder.status).toBe(samplePurchaseOrderInput.status);
        expect(purchaseOrder.valid).toBe(samplePurchaseOrderInput.valid);
        expect(purchaseOrder.shippingFees).toBe(samplePurchaseOrderInput.shippingFees);
        expect(purchaseOrder.comment).toBe(samplePurchaseOrderInput.comment);
        expect(purchaseOrder.totalHT).toBe(samplePurchaseOrderInput.totalHT);
        expect(purchaseOrder.shippingFees).toBe(samplePurchaseOrderInput.shippingFees);
        expect(purchaseOrder.shippingVAT).toBe(samplePurchaseOrderInput.shippingVAT);
        expect(purchaseOrder.paymentDelay).toBe(samplePurchaseOrderInput.paymentDelay);
        expect(purchaseOrder.deposit).toBe(samplePurchaseOrderInput.deposit);
    });
});

