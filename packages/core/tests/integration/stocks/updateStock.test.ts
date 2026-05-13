import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getStockByIdUseCase, updateStockUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";

describe("updateStock.test", () => {
    let supabase: SupabaseClient;

    let productId: number;
    let modelId: number;  
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
        const product = await supabase.from("produits").insert({
            is_pack: false,
            id_categorie: 2,
            id_sous_categories:83,
            id_marque: 1,
            prix_vente_ht: 15.75,
            tva: 20,
            prix_vente_ttc: 18.9,
            cheque_cadeau: false,
            cheque_duree: 0,
            poids: 85,
            etat_publication: "BROUILLON",
            updated_at: new Date().toISOString(),
            stock_min: 0
        }).select("id").single();
        if(product.error) {
            console.error("error product: ", product.error);
            throw new Error("error product: " + product.error.message);
        }
        productId = product.data?.id;
        const model = await supabase.from("modeles").insert({
            id_produit: productId, 
            poids: 85,
            prix_vente_ht: 15.75,
            prix_vente_ttc: 18.9,
            publier: false,
            stock_min: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }).select("id").single();
        if(model.error) {
            console.error("error: ", model.error);
            throw new Error("error: " + model.error.message);
        }
        modelId = model.data?.id;
        const stock = await supabase.from("stocks").insert({
            id_modele: modelId,
            bloque: 0,
            indisponible: 0,
            disponible: 10,
            updated_at: new Date().toISOString(),
        }).select("id_modele").single();
        if(stock.error) {
            console.error("error: ", stock.error);
            throw new Error("error: " + stock.error.message);
        }
    });

    afterAll(async () => {
        await supabase.from("stocks").delete().eq("id_modele", modelId);
        await supabase.from("modeles").delete().eq("id", modelId);
        await supabase.from("produits").delete().eq("id", productId);
    });

    it("should update the stock", async () => {
        await updateStockUseCase([{
            idModel: modelId,
            locked: 1,
            indisponible: 0,
            disponible: 9,
            updatedAt: new Date().toISOString()
        }]);

        const stock = await getStockByIdUseCase(modelId);
        expect(stock.item.locked).toBe(1);
        expect(stock.item.indisponible).toBe(0);
        expect(stock.item.disponible).toBe(9);
    });
});