import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listAllShopsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";

describe("listAllShopsUseCase", () => {
    let supabase: SupabaseClient;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
        // select all shops having a name starting with "Test Shop"
        const { data, error } = await supabase.from("point_ventes").select("id").eq("nom", "Test Shop");
        if (error) {
            console.error("LIST ALL SHOPS -> Error deleting shops -> delete shop: ", error);
        } else {
            const shopIds = data?.map((shop) => shop.id);
            // select all caisse having a id_point_vente in shopIds
            const { data: caisseData, error: caisseError } = await supabase.from("caisses").select("id").in("id_point_vente", shopIds);
            if (caisseError) {
                console.error("LIST ALL SHOPS -> Error deleting caisse -> delete caisse: ", caisseError);
            } else {
                const caisseIds = caisseData?.map((caisse) => caisse.id);
                // delete all caisse lines having a id_caisse in caisseIds
                const { error: errorDeleteCaisseLines } = await supabase.from("caisse_lignes").delete().in("id_caisse", caisseIds);
                if (errorDeleteCaisseLines) {
                    console.error("LIST ALL SHOPS -> Error deleting caisse lines -> delete caisse line: ", errorDeleteCaisseLines);
                } else {
                    // delete all caisse
                    const { error: errorDeleteCaisse } = await supabase.from("caisses").delete().in("id_point_vente", shopIds);
                    if (errorDeleteCaisse) {
                        console.error("LIST ALL SHOPS -> Error deleting caisse -> delete caisse: ", errorDeleteCaisse);
                    }   else {
                        // delete all shop lines for each shop
                        const { error: errorDeleteShopLines } = await supabase.from("point_vente_lignes").delete().in("id_point_vente", shopIds);
                        if (errorDeleteShopLines) {
                            console.error("LIST ALL SHOPS -> Error deleting shop lines -> delete shop line: ", errorDeleteShopLines);
                        }   else {
                            // delete all shops
                            const { error: errorDeleteShops } = await supabase.from("point_ventes").delete().in("id", shopIds);
                            if (errorDeleteShops) {
                                console.error("LIST ALL SHOPS -> Error deleting shops -> delete shop: ", errorDeleteShops);
                            }
                        }
                    }
                }
            }
        }
    });

    it("should return all shops", async () => {
        const shops = await listAllShopsUseCase(false);
        expect(shops.total).toBeGreaterThan(1);
        expect(shops.count).toBeGreaterThan(1);
        expect(shops.items).toBeDefined();
        expect(shops.items).toBeInstanceOf(Array);
        expect(shops.items.length).toBe(shops.count);
        expect(shops.items[0]?.id).toBeDefined();
        expect(shops.items[0]?.name).toBeDefined();
        expect(shops.items[0]?.status).toBeDefined();
        expect(shops.items[0]?.department).toBeDefined();
        expect(shops.items[0]?.expirationDate).toBeDefined();
        expect(shops.items[0]?.createdAt).toBeDefined();
    });

    it("should return only active shops", async () => {
        const shops = await listAllShopsUseCase(true);
        expect(shops.total).toBeGreaterThanOrEqual(2);
        expect(shops.count).toBeGreaterThanOrEqual(2);
    });
});