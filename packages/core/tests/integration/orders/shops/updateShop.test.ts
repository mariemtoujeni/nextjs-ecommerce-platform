import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { updateShopUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";
import { ShopStatus } from "../../../../src/models";

describe("updateShopUseCase", () => {
    let supabase: SupabaseClient;
    let shopId: number;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
        const { data, error } = await supabase.from("point_ventes").insert({ nom: "Test Shop", actif: 1, statut: ShopStatus.OPEN, numero_departement: "6", date_fin: new Date().toISOString(), date_creation: new Date().toISOString() }).select("id").single();
        if (error) throw error;
        shopId = data.id;
    });

    afterAll(async () => {
        const { error } = await supabase.from("point_vente_lignes").delete().eq("id_point_vente", shopId);
        if (error) {
            console.error("UPDATE SHOP -> Error deleting shop lines -> delete shop line: ", error);
        }
        const { error: error2 } = await supabase.from("point_ventes").delete().eq("id", shopId);
        if (error2) {
            console.error("UPDATE SHOP -> Error deleting shop -> delete shop: ", error2);
        }
    });

    it("should update a shop", async () => {
        const shop = await updateShopUseCase(shopId, { name: "Test Shop Updated 6", status: ShopStatus.CLOSED });
        expect(shop.name).toBe("Test Shop Updated 6");
        expect(shop.status).toBe(ShopStatus.CLOSED);
    });
});