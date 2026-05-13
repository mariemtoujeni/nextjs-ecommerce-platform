import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listPurchaseOrderLinesUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { BadRequestError, NotFoundError } from "@repo/core/types";
import { PurchaseOrderLine } from "@repo/core/models";
import { getInjection } from "../../../../src/types/di";

describe("listPurchaseOrderLinesUseCase", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should return all purchase order lines by supplierId", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const purchaseOrderLines = await listPurchaseOrderLinesUseCase({
            supplierId: 1
        });
        expect(purchaseOrderLines).toBeInstanceOf(Array);
        if (Array.isArray(purchaseOrderLines)) {
            expect(purchaseOrderLines.length).toBe(2);
        } else {
            throw new Error("Expected purchaseOrderLines to be an array");
        }
    });

    it("should return all purchase order lines by modelId", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const purchaseOrderLines = await listPurchaseOrderLinesUseCase({
            modelId: 1
        });
        expect(purchaseOrderLines).toBeInstanceOf(Array);
        if (Array.isArray(purchaseOrderLines)) {
            expect(purchaseOrderLines.length).toBe(1);
        } else {
            throw new Error("Expected purchaseOrderLines to be an array");
        }
    });

    it("should return a single purchase order line by supplierId and modelId", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const purchaseOrderLines = await listPurchaseOrderLinesUseCase({
            supplierId: 1,
            modelId: 1
        });
        expect(purchaseOrderLines).toBeInstanceOf(Object);
        if (typeof purchaseOrderLines === "object") {
            const purchaseOrderLine = purchaseOrderLines as PurchaseOrderLine;
            expect(purchaseOrderLine.id).toBe(1);
            expect(purchaseOrderLine.orderSupplierId).toBe(1);
            expect(purchaseOrderLine.modelId).toBe(1);
            expect(purchaseOrderLine.validationDate).toBeInstanceOf(Date);
            expect(purchaseOrderLine.quantity).toBe(10);
            expect(purchaseOrderLine.receivedQuantity).toBe(0);
            expect(purchaseOrderLine.unitHtPrice).toBe(10);
            expect(purchaseOrderLine.discount).toBe(10);
            expect(purchaseOrderLine.vat).toBe(20);
            expect(purchaseOrderLine.valid).toBe(true);
            expect(purchaseOrderLine.comment).toBe("Comment 1");
            expect(purchaseOrderLine.ttcPrice).toBe(100);
        } else {
            throw new Error("Expected purchaseOrderLines to be an object");
        }
    });

    it("should expect exception if supplierId is not found", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(listPurchaseOrderLinesUseCase({
            supplierId: 999
        })).rejects.toThrow(NotFoundError);
    });

    it("should expect exception if modelId is not found", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(listPurchaseOrderLinesUseCase({
            modelId: 999
        })).rejects.toThrow(NotFoundError);
    });

    it("should expect exception if supplierId and modelId are not provided", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(listPurchaseOrderLinesUseCase({})).rejects.toThrow(BadRequestError);
    });
});