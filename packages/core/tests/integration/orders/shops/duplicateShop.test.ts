import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { duplicateShopUseCase } from "../../../../src/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";
import { Department, ShopPresenterInput, ShopStatus } from "../../../../src/models";

describe("duplicateShopUseCase", () => {
    let supabase: SupabaseClient;
    let shopId: number;
    let duplicatedShopId: number;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
        const { data, error } = await supabase.from("point_ventes").insert({ 
            nom: "Test Shop", 
            actif: 1, 
            statut: ShopStatus.OPEN, 
            numero_departement: Department.AVEYRON, 
            date_fin: new Date().toISOString(), 
            date_creation: new Date().toISOString() 
        }).select("id").single();
        if (error) throw error;
        shopId = data.id;

        const { data: shopLineData, error: shopLineError } = await supabase.from("point_vente_lignes").insert({ 
            id_point_vente: shopId, 
            id_modele: 42692, 
            stock_vendu: 0,
            stock_initial: 10,
            stock_final: 10,
            prix_total_ttc: 0
        }).select("*").single();
        if (shopLineError) throw shopLineError;
    });

    afterAll(async () => {
        const { error } = await supabase.from("point_vente_lignes").delete().in("id_point_vente", [shopId, duplicatedShopId]);
        if (error) {
            console.error("Error deleting shop lines -> delete shop line: ", error);
        }
        const { error: error2 } = await supabase.from("point_ventes").delete().in("id", [shopId, duplicatedShopId]);
        if (error2) {
            console.error("Error deleting shop -> delete shop: ", error2);
        }
    });
    
    it("should duplicate a shop", async () => {
        const shopToDuplicate : ShopPresenterInput = {
            name: "Test Shop",
            expirationDate: new Date().toISOString(),
            isActive: false,
            status: ShopStatus.CLOSED,
            department: Department.AVEYRON,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lines: [
                {
                    idModel: 42692,
                    idShop: shopId,
                    initialQuantity: 10,
                    soldQuantity: 0,
                    finalQuantity: 10,
                    totalPriceTTC: 0
                }
            ]
        };
        const shop = await duplicateShopUseCase(shopToDuplicate);
        duplicatedShopId = shop.item.id;
        expect(shop.error).toBeUndefined();
        expect(shop.item.status).toBe(ShopStatus.DRAFT);
        expect(shop.item.isActive).toBe(false);
        expect(shop.item.id).not.toBe(shopId);
        expect(shop.item.name).toBe("Test Shop");
        expect(shop.item.department).toBe(Department.AVEYRON);

        expect(shop.item.lines.length).toBe(1);
        expect(shop.item.lines[0]?.idModel).toBe(42692);
        expect(shop.item.lines[0]?.idShop).toBe(duplicatedShopId);
        expect(shop.item.lines[0]?.initialQuantity).toBe(10);
        expect(shop.item.lines[0]?.soldQuantity).toBe(0);
        expect(shop.item.lines[0]?.finalQuantity).toBe(0);
        expect(shop.item.lines[0]?.totalPriceTTC).toBe(0);
    });

});