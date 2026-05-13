import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { updateModel } from "../../../src/usecases/products/updateModel";
import { TestUser, signInTestUser, signOutTestUser } from "../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types/di";
import { ModelUpdate } from "../../../src/models/Model";


describe("updateModel", () => {
    const modelId = 128610;
    const oldModelData = {}
    const oldModelAdminData = {}
    let supabase: SupabaseClient;
    const update: ModelUpdate = {
        weight: 10,
        priceWithoutVat: 100,
        priceWithVat: 120,
        published: false,
        minStock: 10,
        purchasePrice: 5,
        barcode: "123",
        supplierReference: "456",
        manufacturerReference: "789"
    }

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClientAdmin");
        const model = await supabase.from("modeles").select("*").eq("id", modelId).single();
        Object.assign(oldModelData, model);
        const modelAdmin = await supabase.from("modele_admin").select("*").eq("id_modele", modelId).single();
        Object.assign(oldModelAdminData, modelAdmin);
    });

    afterAll(async () => {
        await supabase.from("modeles").update(oldModelData).eq("id", modelId);
        await supabase.from("modele_admin").update(oldModelAdminData).eq("id_modele", modelId);
        await signOutTestUser();
    });
    

  it("should update the model", async () => {
    await updateModel(modelId, update);
    const { data: model, error: modelError } = await supabase.from("modeles").select("*, modeles_admin(*)").eq("id", modelId).single();
    expect(modelError).toBeNull();
    expect(model).toBeDefined();
    expect(model.poids).toBe(update.weight);
    expect(model.prix_vente_ht).toBe(update.priceWithoutVat);
    expect(model.prix_vente_ttc).toBe(update.priceWithVat);
    expect(model.publier).toBe(update.published);
    expect(model.stock_min).toBe(update.minStock);
    expect(model.modeles_admin.prix_achat_ht).toBe(update.purchasePrice);
    expect(model.modeles_admin.code_barre).toBe(update.barcode);
    expect(model.modeles_admin.code_article_fournisseur).toBe(update.supplierReference);
    expect(model.modeles_admin.reference_fabricant).toBe(update.manufacturerReference);
  });
});