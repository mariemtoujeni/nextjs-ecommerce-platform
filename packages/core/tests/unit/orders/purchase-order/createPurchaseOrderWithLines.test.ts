import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createPurchaseOrderWithLinesUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { PaymentMode, PurchaseOrderPresenterInput, PurchaseOrderStatus } from "@repo/core/models";
import { getInjection } from "../../../../src/types/di";

describe("createPurchaseOrderWithLines", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should create a purchase order with lines", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const purchaseOrderInput: PurchaseOrderPresenterInput = {
            paymentMode: PaymentMode.CHEQUE,
            remise: 0,
            totalHT: 0,
            valid: false,
            createdAt: new Date(),
            supplierId: 2,
            clubId: 0,
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

        expect(purchaseOrder.id).toBeDefined();
        expect(purchaseOrder.lines.length).toBe(1);
        expect(purchaseOrder.lines[0]?.modelId).toBe(124936);
        expect(purchaseOrder.lines[0]?.quantity).toBe(1);
        expect(purchaseOrder.lines[0]?.receivedQuantity).toBe(0);
        expect(purchaseOrder.lines[0]?.unitHtPrice).toBe(100);
        expect(purchaseOrder.lines[0]?.discount).toBe(0);
        expect(purchaseOrder.lines[0]?.vat).toBe(20);
        expect(purchaseOrder.lines[0]?.valid).toBe(false);
        expect(purchaseOrder.lines[0]?.comment).toBe("");
        expect(purchaseOrder.lines[0]?.ttcPrice).toBe(100);
    });
});
