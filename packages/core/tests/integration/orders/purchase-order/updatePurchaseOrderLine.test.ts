import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { updatePurchaseOrderLineUseCase } from "@repo/core/usecases";
import { getInjection, InternalServerError, NotFoundError } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../../utils";

describe("updatePurchaseOrderLineUseCase", () => {
    let supabase: SupabaseClient;
    let purchaseOrderLineId: number;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
        await supabase.from("commande_fournisseur_lignes").update({
            quantity: 1
        }).eq("id", 295544);
    });

    it("should update a purchase order line", async () => {
        const purchaseOrderLine = await updatePurchaseOrderLineUseCase({
            id: 295544,
            orderSupplierId: 21336,
            modelId: 124933,
            quantity: 5
        });
        expect(purchaseOrderLine.id).toBe(295544);
        expect(purchaseOrderLine.orderSupplierId).toBe(21336);
        expect(purchaseOrderLine.modelId).toBe(124933);
        expect(purchaseOrderLine.quantity).toBe(5);
    });

    it("should expect exception if id is not found", async () => {
        await expect(updatePurchaseOrderLineUseCase({
            id: 999,
            orderSupplierId: 21336,
            modelId: 124933,
            quantity: 5
        })).rejects.toThrow(InternalServerError);
    });
});