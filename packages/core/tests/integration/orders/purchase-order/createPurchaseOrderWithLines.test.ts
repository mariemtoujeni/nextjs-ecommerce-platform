import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPurchaseOrderWithLinesUseCase } from "@repo/core/usecases";
import { getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../../utils";
import { PaymentMode, PurchaseOrderPresenterInput, PurchaseOrderStatus } from "@repo/core/models";

describe("createPurchaseOrderWithLinesUseCase", () => {
    let supabase: SupabaseClient;
    let purchaseOrderId: number = 0;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
        const { error } = await supabase.from("commande_fournisseur_lignes").delete().eq("id_commande_fournisseur", purchaseOrderId);
        if (error) {
            console.error("CREATE PURCHASE ORDER WITH LINES -> Error deleting purchase order lines -> delete purchase order line: ", error, "| purchaseOrderId: ", purchaseOrderId);
        }
        const { error: error2 } = await supabase.from("commandes_fournisseur").delete().eq("id", purchaseOrderId);
        if (error2) {
            console.error("CREATE PURCHASE ORDER WITH LINES -> Error deleting purchase order -> delete purchase order: ", error2, "| purchaseOrderId: ", purchaseOrderId);
        }
    });

    it("should create a purchase order with lines", async () => {
        const purchaseOrderInput: PurchaseOrderPresenterInput = {
            paymentMode: PaymentMode.CHEQUE,
            remise: 0,
            totalHT: 100,
            valid: false,
            createdAt: new Date(),
            supplierId: 2,
            shippingFees: 0,
            shippingVAT: 0,
            paymentDelay: 0,
            deposit: 0,
            comment: "",
            status: PurchaseOrderStatus.BROUILLON,
            lines: [
                {
                    modelId: 124936,
                    quantity: 1,
                    receivedQuantity: 0,
                    unitHtPrice: 100,
                    discount: 0,
                    vat: 20,
                    valid: false,
                    comment: "",
                    ttcPrice: 100,
                    orderSupplierId: 0
                }
            ]
        }

        const purchaseOrder = await createPurchaseOrderWithLinesUseCase(purchaseOrderInput);
        purchaseOrderId = purchaseOrder.id;

        expect(purchaseOrder.id).toBeDefined();
        expect(purchaseOrder.supplierId).toBe(2);
        expect(purchaseOrder.status).toBe(PurchaseOrderStatus.BROUILLON);
        expect(purchaseOrder.totalHT).toBe(100);
        expect(purchaseOrder.lines.length).toBe(1);
        expect(purchaseOrder.lines[0]?.modelId).toBe(124936);
        expect(purchaseOrder.lines[0]?.quantity).toBe(1);
        expect(purchaseOrder.lines[0]?.receivedQuantity).toBe(0);
        expect(purchaseOrder.lines[0]?.unitHtPrice).toBe(100);
        expect(purchaseOrder.lines[0]?.discount).toBe(0);
    });
});