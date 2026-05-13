import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { deleteProductAlertUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";
import { ProductStatus } from "@repo/core/models";
import { signInTestUser, TestUser } from "../utils";

describe("deleteProductAlertUseCase", () => {
  let supabase: SupabaseClient;

  const modelId = 997002;
  const productId = 999002;
  const clientNumber = null; 
  const alertId = 996002;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    let { error: productError } = await supabase
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
    if (productError) throw productError;

    let { error: modelError } = await supabase
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
    if (modelError) throw modelError;

    let { error: alertError } = await supabase
      .from('alertes_rupture')
      .upsert([{
        id: alertId,
        numero_client: clientNumber,
        id_modele: modelId,
        email: "testuser@example.com",
        actif: true,
        email_envoye: false,
      }]);
    if (alertError) throw alertError;
  });

  afterAll(async () => {

    let { error: alertDeleteError } = await supabase
      .from('alertes_rupture')
      .delete()
      .eq('id', alertId);
    if (alertDeleteError) console.error('Failed to delete alert:', alertDeleteError);

    let { error: modelDeleteError } = await supabase
      .from('modeles')
      .delete()
      .eq('id', modelId);
    if (modelDeleteError) console.error('Failed to delete model:', modelDeleteError);

    let { error: productDeleteError } = await supabase
      .from('produits')
      .delete()
      .eq('id', productId);
    if (productDeleteError) console.error('Failed to delete product:', productDeleteError);
  });

  it("should delete the product alert", async () => {
    const result = await deleteProductAlertUseCase(alertId);
    expect(result).toBeUndefined();

    const { data, error } = await supabase
      .from('alertes_rupture')
      .select('*')
      .eq('id', alertId);

    if (error) throw error;
    expect(data).toHaveLength(0);
  });
});
