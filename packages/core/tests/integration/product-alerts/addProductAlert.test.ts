import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { addProductAlertUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";
import { CreateAlertInput, ProductStatus } from "../../../src/models";
import { signInTestUser, TestUser } from "../utils";


describe("addProductAlertUseCase", () => {
  let supabase: SupabaseClient;

  const modelId = 997001;
  const productId = 999001;
  const idAlert = 996001;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);

    supabase = await getInjection("ISupabaseClient");

    let produit = await supabase
      .from('produits')
      .upsert([{
        id: productId,
        is_pack: false,
        prix_vente_ht: 0,
        tva: 0,
        prix_vente_ttc: 0,
        poids: 0,
        cheque_cadeau: false,
        etat_publication: ProductStatus.DEACTIVATED,
      }]);
    if (produit.error) throw produit.error;

    let { error } = await supabase
      .from('modeles')
      .upsert([{
        id: modelId,
        id_produit: productId,
        poids: 0,
        prix_vente_ht: 0,
        prix_vente_ttc: 0,
        publier: false,
        stock_min: 0,
      }]);
    if (error) throw error;


  });

  afterAll(async () => {
    const alertDelete = await supabase
      .from('alertes_rupture')
      .delete()
      .eq('id_modele', modelId);
    if (alertDelete.error) console.error('Failed to delete alert:', alertDelete.error);

    const modelDelete = await supabase
      .from('modeles')
      .delete()
      .eq('id', modelId);
    if (modelDelete.error) console.error('Failed to delete model:', modelDelete.error);

    const productDelete = await supabase
      .from('produits')
      .delete()
      .eq('id', productId);
    if (productDelete.error) console.error('Failed to delete product:', productDelete.error);
  });


  it("should create a product alert and return it", async () => {
    const newAlert: CreateAlertInput = {
      idModel: modelId,
      email: "testuser@example.com",
    }
    const result = await addProductAlertUseCase(newAlert);
    
    expect(result.idModel).toBeDefined();
    expect(result.idModel).toBe(modelId);
  });

});
