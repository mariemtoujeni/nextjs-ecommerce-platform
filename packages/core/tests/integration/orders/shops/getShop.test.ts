import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getShopUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";
import { ShopStatus } from "../../../../src/models";

describe("getShopUseCase", () => {
    let supabase: SupabaseClient;
    let shopId: number;
    let shopLineId: number;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");

        const { data, error } = await supabase.from("point_ventes").insert({ 
            nom: "Test Shop", 
            actif: 1, statut: 
            ShopStatus.OPEN, 
            numero_departement: "6", 
            date_fin: new Date().toISOString(), 
            date_creation: new Date().toISOString() 
        }).select("id").single();
        if (error) throw error;
        shopId = data.id;

        const { data: shopData, error: shopError } = await supabase.from("point_vente_lignes").insert({
            id_modele: 791,
            id_point_vente: shopId,
            stock_initial: 10,
            stock_vendu: 0,
            stock_final: 10,
            prix_total_ttc: 0,
        });
        if (shopError) throw shopError;
    });

    afterAll(async () => {
        const { error } = await supabase.from("point_vente_lignes").delete().eq("id_point_vente", shopId);
        if (error) {
            console.error("GET SHOP -> Error deleting shop lines -> delete shop line: ", error);
        }
        const { error: error2 } = await supabase.from("point_ventes").delete().eq("id", shopId);
        if (error2) {
            console.error("GET SHOP -> Error deleting shop -> delete shop: ", error2);
        }
    });

    it("should return a shop", async () => {
        const shop = await getShopUseCase(shopId);
        expect(shop.id).toBe(shopId);
        expect(shop.name).toBe("Test Shop");
        expect(shop.status).toBe(ShopStatus.OPEN);
        expect(shop.department).toBe("6");
        expect(shop.expirationDate).toBeDefined();
        expect(shop.createdAt).toBeDefined();
    });
});
