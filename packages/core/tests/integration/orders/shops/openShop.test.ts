import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { openShopUseCase, ShopPresenterWithModels } from "../../../../src/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { BadRequestError, getInjection } from "../../../../src/types";
import { Department, ShopStatus } from "../../../../src/models";

describe("openShopUseCase", () => {
    let supabase: SupabaseClient;
    let shopId: number;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
        const { data, error } = await supabase.from("point_ventes").insert({ 
            nom: "Test Shop", 
            actif: 1, 
            statut: ShopStatus.DRAFT, 
            numero_departement: "03" as Department, 
            date_fin: new Date().toISOString(), 
            date_creation: new Date().toISOString() }
        ).select("id").single();
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
        await supabase.from("point_vente_lignes").delete().eq("id_point_vente", shopId);
        await supabase.from("point_ventes").delete().eq("id", shopId);
    });

    it("should open a shop", async () => {
        const shopPresenter : ShopPresenterWithModels = {
            id: shopId,
            name: "Test Shop",
            expirationDate: new Date(),
            isActive: false,
            department: "03" as Department,
            status: ShopStatus.DRAFT,
            createdAt: new Date(),
            lines: [{
                idModel: 42692,
                idShop: shopId,
                initialQuantity: 10,
                soldQuantity: 0,
                finalQuantity: 10,
                totalPriceTTC: 0,
                model: {
                    name: "Test Model",
                    attributs: [],
                    price: 0,
                    image: ""
                }
            }]
        };
        const shop = await openShopUseCase(shopPresenter);
        expect(shop.error).toBeUndefined();
        expect(shop.item.status).toBe(ShopStatus.OPEN);        
    });

    it("should not open a shop if the shop is not draft", async () => {
        const { data, error } = await supabase.from("point_ventes").update({ statut: ShopStatus.CLOSED }).eq("id", shopId);
        if (error) throw error;

        const shopPresenter : ShopPresenterWithModels = {
            id: shopId,
            name: "Test Shop",
            expirationDate: new Date(),
            isActive: false,
            department: "03" as Department,
            status: ShopStatus.DRAFT,
            createdAt: new Date(),
            lines: [{
                idModel: 42692,
                idShop: shopId,
                initialQuantity: 10,
                soldQuantity: 0,
                finalQuantity: 10,
                totalPriceTTC: 0,
                model: {
                    name: "Test Model",
                    attributs: [],
                    price: 0,
                    image: ""
                }
            }]
        };

        await expect(openShopUseCase(shopPresenter)).rejects.toThrow(BadRequestError);
    });

    it("should throw an error if the shop lines has initial quantity less than 0", async () => {
        const { data, error } = await supabase.from("point_ventes").update({ statut: ShopStatus.DRAFT }).eq("id", shopId);
        if (error) throw error;

        const shopPresenter : ShopPresenterWithModels = {
            id: shopId,
            name: "Test Shop",
            expirationDate: new Date(),
            isActive: false,
            department: "03" as Department,
            status: ShopStatus.DRAFT,
            createdAt: new Date(),
            lines: [{
                idModel: 42692,
                idShop: shopId,
                initialQuantity: -1,
                soldQuantity: 0,
                finalQuantity: 10,
                totalPriceTTC: 0,
                model: {
                    name: "Test Model",
                    attributs: [],
                    price: 0,
                    image: ""
                }
            }]
        };

        await expect(openShopUseCase(shopPresenter)).rejects.toThrow(BadRequestError);
    });
});