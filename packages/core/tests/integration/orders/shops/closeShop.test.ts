import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeShopUseCase } from "../../../../src/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";
import { ShopPresenter, ShopStatus, Stock } from "../../../../src/models";

describe("closeShopUseCase", () => {
    let supabase: SupabaseClient;
    let shopId: number;
    let initialStock: Stock;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
        const { data, error } = await supabase.from("point_ventes").insert({ 
            nom: "Test Shop", 
            actif: 1, 
            statut: ShopStatus.OPEN, 
            numero_departement: "6", 
            date_fin: new Date().toISOString(), 
            date_creation: new Date().toISOString() }
        ).select("id").single();
        if (error) throw error;
        shopId = data.id;

        const stocks = await supabase.from("stocks").select("*").eq("id_modele", 128589).single();
        if (stocks.error) throw stocks.error;
        initialStock = {
            idModel: stocks.data?.id_modele,
            locked: stocks.data?.bloque,
            disponible: stocks.data?.disponible,
            indisponible: stocks.data?.indisponible,
            updatedAt: stocks.data?.updated_at
        };
        const { data: shopLineData, error: shopLineError } = await supabase.from("point_vente_lignes").insert({ 
            id_point_vente: shopId, 
            id_modele: 128589, 
            stock_vendu: 10,
            stock_initial: 10,
            stock_final: 0,
            prix_total_ttc: 0
        }).select("*").single();
        if (shopLineError) throw shopLineError;
    });

    afterAll(async () => {
        await supabase.from("point_vente_lignes").delete().eq("id_point_vente", shopId);
        await supabase.from("point_ventes").delete().eq("id", shopId);
        await supabase.from("stocks").update({
            disponible: initialStock.disponible,
            indisponible: initialStock.indisponible,
            updated_at: initialStock.updatedAt
        }).eq("id_modele", initialStock.idModel);
    });

    it("should close a shop", async () => {
        const expirationDate = new Date();
        const shopPresenter :ShopPresenter = {
            id: shopId,
            name: "Test Shop",
            expirationDate: expirationDate,
            isActive: false,
            department: "6",
            status: ShopStatus.OPEN,
            createdAt: new Date(),
            lines: [
                {
                    idModel: 128589,
                    idShop: shopId,
                    initialQuantity: 10,
                    soldQuantity: 10,
                    finalQuantity: 0,
                    totalPriceTTC: 0
                }
            ]
        };
        const shop = await closeShopUseCase(shopPresenter);
        expect(shop.error).toBeUndefined();
        expect(shop.item.status).toBe(ShopStatus.CLOSED);
        expect(shop.item.isActive).toBe(false);
        
        // Check if the stock is updated
        const stock = await supabase.from("stocks").select("*").eq("id_modele", 128589).single();
        expect(stock.data?.disponible).toBe(initialStock.disponible - 10);
    });


});