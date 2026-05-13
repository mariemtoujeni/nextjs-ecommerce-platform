import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createShopLineUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { BadRequestError, getInjection } from "../../../../src/types";
import { Department, ShopStatus } from "../../../../src/models";

describe("createShopLineUseCase", () => {
    let supabase: SupabaseClient;
    let shopId: number;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
        const { data, error } = await supabase.from("point_ventes").insert({ 
            nom: "Test Shop", 
            actif: 1, 
            statut: ShopStatus.OPEN, 
            numero_departement: "6", 
            date_fin: new Date().toISOString(), 
            date_creation: new Date().toISOString() 
        }).select("id").single();
        if (error) throw error;
        shopId = data.id;
    });

    afterAll(async () => {
        const { error } = await supabase.from("point_vente_lignes").delete().eq("id_point_vente", shopId);
        if (error) {
            console.error("CREATE SHOP LINE -> Error deleting shop lines -> delete shop line: ", error, "| shopId: ", shopId);
        }
        const { error: error2 } = await supabase.from("point_ventes").delete().eq("id", shopId);
        if (error2) {
            console.error("CREATE SHOP LINE -> Error deleting shop -> delete shop: ", error2);
        }
    });

    it("should create a shop line", async () => {
        const shopLine = await createShopLineUseCase([{ 
            idModel: 42692, 
            idShop: shopId, 
            initialQuantity: 10, 
            soldQuantity: 0, 
            finalQuantity: 10, 
            totalPriceTTC: 0 
        }]);
        expect(shopLine).toBeDefined();
        expect(shopLine[0]?.idModel).toBe(42692);
        expect(shopLine[0]?.idShop).toBe(shopId);
        expect(shopLine[0]?.initialQuantity).toBe(10);
        expect(shopLine[0]?.soldQuantity).toBe(0);
        expect(shopLine[0]?.finalQuantity).toBe(10);
        expect(shopLine[0]?.totalPriceTTC).toBe(0);
    });

    it("should not create a shop line if the stock is less than the minimum stock", async () => {
        await expect(createShopLineUseCase([{ 
            idModel: 24324, 
            idShop: shopId, 
            initialQuantity: 10, 
            soldQuantity: 0, 
            finalQuantity: 10, 
            totalPriceTTC: 0 
        }])).rejects.toThrow(BadRequestError);
    });
});