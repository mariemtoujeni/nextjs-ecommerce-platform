import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updatePurchaseOrderLineUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { NotFoundError } from "@repo/core/types";
import { getInjection } from "../../../../src/types/di";

describe("updatePurchaseOrderLineUseCase", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should update a purchase order line", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const purchaseOrderLine = await updatePurchaseOrderLineUseCase({
            id: 1,
            orderSupplierId: 1,
            modelId: 1,
            quantity: 20,
            receivedQuantity: 10,
            comment: "Comment 1 updated"
        });
        expect(purchaseOrderLine.id).toBe(1);
        expect(purchaseOrderLine.quantity).toBe(20);
        expect(purchaseOrderLine.receivedQuantity).toBe(10);
        expect(purchaseOrderLine.unitHtPrice).toBe(10);
        expect(purchaseOrderLine.discount).toBe(10);
        expect(purchaseOrderLine.vat).toBe(20);
        expect(purchaseOrderLine.valid).toBe(true);
        expect(purchaseOrderLine.comment).toBe("Comment 1 updated");
        expect(purchaseOrderLine.ttcPrice).toBe(100);
    });

    it("should expect exception if id is not found", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(updatePurchaseOrderLineUseCase({
            id: 999,
            orderSupplierId: 1,
            modelId: 1,
            quantity: 20
        })).rejects.toThrow(NotFoundError);
    });
});