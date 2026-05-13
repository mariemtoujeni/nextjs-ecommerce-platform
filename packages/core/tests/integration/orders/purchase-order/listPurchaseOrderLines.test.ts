import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listPurchaseOrderLinesUseCase } from "@repo/core/usecases";
import { getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../../utils";
import { PurchaseOrderLine } from "@repo/core/models";

describe("listPurchaseOrderLinesUseCase", () => {
    let supabase: SupabaseClient;
    let purchaseOrderId: number;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
        
    });

    it("should return all purchase order lines by supplierId", async () => {
        const purchaseOrderLines = await listPurchaseOrderLinesUseCase({
            supplierId: 2
        });
        expect(purchaseOrderLines).toBeInstanceOf(Array);
        if (Array.isArray(purchaseOrderLines)) {
            expect(purchaseOrderLines.length).toBeGreaterThan(900);
        } else {
            throw new Error("Expected purchaseOrderLines to be an array");
        }
    });

    it("should return all purchase order lines by modelId", async () => {
        const purchaseOrderLines = await listPurchaseOrderLinesUseCase({
            modelId: 124933
        });
        expect(purchaseOrderLines).toBeInstanceOf(Array);
        if (Array.isArray(purchaseOrderLines)) {
            expect(purchaseOrderLines.length).toBeGreaterThan(0);
        } else {
            throw new Error("Expected purchaseOrderLines to be an array");
        }
    });

    it("should return a single purchase order line by supplierId and modelId", async () => {
        const purchaseOrderLines = await listPurchaseOrderLinesUseCase({
            supplierId: 2,
            modelId: 124933
        });
        expect(purchaseOrderLines).toBeInstanceOf(Object);
        if (typeof purchaseOrderLines === "object") {
            const purchaseOrderLine = purchaseOrderLines as PurchaseOrderLine;
            expect(purchaseOrderLine.id).toBe(295544);
            expect(purchaseOrderLine.orderSupplierId).toBe(21336);
            expect(purchaseOrderLine.modelId).toBe(124933);
        } else {
            throw new Error("Expected purchaseOrderLines to be an object");
        }
    });
});