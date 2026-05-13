import { afterAll, beforeAll, beforeEach, afterEach, describe, expect, it } from "vitest";
import { addToCartUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { CartActionType, OnlineShop, ProductAdd } from "@repo/core/models";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";

describe("addToCartUseCase", () => {
  let supabase: SupabaseClient;
  let currentUserId: string;
  let testModelId: number;
  let testProductId: number;

  beforeAll(async () => {
    const { session, user } = await signInTestUser(TestUser.CUSTOMER);
    expect(session).toBeTruthy();
    expect(user).toBeTruthy();
    supabase = await getInjection("ISupabaseClient");
    currentUserId = user.id;
  });

  beforeEach(async () => {
    const { data: dataProduct, error: errorProduct } = await supabase
      .from('produits')
      .insert({
          prix_vente_ht: 100.0,
          tva: 20.0,
          prix_vente_ttc: 120.0,
          poids: 1.5,
          stock_min: -5
        })
        .select("id")
        .single();
    if (errorProduct) throw errorProduct;
    testProductId = dataProduct.id;
    const { data, error } = await supabase
      .from("modeles")
      .insert({
        id_produit: testProductId,
        poids: 0,
        prix_vente_ht: 25,
        prix_vente_ttc: 31.5,
      })
      .select("id")
      .single();

    if (error) throw error;
    testModelId = data.id;

    const { error: stockError } = await supabase
    .from("stocks")
    .insert({
      id_modele: testModelId,
      disponible: 10,  
      indisponible: 0,
      bloque: 0,
    });

  if (stockError) throw stockError;

  });

  afterEach(async () => {
  if (testModelId) {
    await supabase.from("stocks").delete().eq("id_modele", testModelId);
    await supabase.from("modeles").delete().eq("id", testModelId);
  }
  if(testProductId) {
    await supabase.from("produits").delete().eq("id", testProductId);
  }
  });

  afterAll(async () => {
    await supabase.from("paniers").delete().eq("id_user", currentUserId);
  });

  it("creates a cart and adds an item when cart is empty", async () => {
    const result = await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.INCREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: "Grand"
    });

    expect(result.outOfStock).toBe(false);
    const item = result.items.find(r => r.modelId === testModelId);
    expect(item).toBeDefined();
    expect(item!.quantity).toBe(1);
    expect(item!.userId).toBe(currentUserId);
  });

  it("increments quantity", async () => {
    await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.INCREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    const result = await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.INCREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    expect(result.outOfStock).toBe(false);
    const item = result.items.find(r => r.modelId === testModelId);
    expect(item!.quantity).toBe(2);
  });

  it("decrements quantity", async () => {
    await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.INCREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });
    await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.INCREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    const result = await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.DECREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    expect(result.outOfStock).toBe(false);
    const item = result.items.find(r => r.modelId === testModelId);
    expect(item!.quantity).toBe(1);
  });

  it("removes the item if quantity reaches zero", async () => {
    await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.INCREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    const result = await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.DECREMENT,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    expect(result.outOfStock).toBe(false);
    const item = result.items.find(r => r.modelId === testModelId);
    expect(item).toBeUndefined();
  });

  it("adds an item with specific quantity", async () => {
    const quantityToAdd = 5;

    const result = await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.BULK_ADD,
      quantity: quantityToAdd,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    expect(result.outOfStock).toBe(false);
    const item = result.items.find(r => r.modelId === testModelId);
    expect(item).toBeDefined();
    expect(item!.quantity).toBe(quantityToAdd);
  });

  it("updates existing item's quantity with specific quantity", async () => {
     await addToCartUseCase({
       userId: currentUserId,
       modelId: testModelId,
       type: CartActionType.BULK_ADD,
       quantity: 3,
       textPersonnalisation: "je souhaite ajouter mon prénom",
       typePersonnalisation: ""
     });

    const result = await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.BULK_ADD,
      quantity: 2,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    expect(result.outOfStock).toBe(false);
    const item = result.items.find(r => r.modelId === testModelId);
    expect(item).toBeDefined();
    expect(item!.quantity).toBe(5);
  });

  it("returns out of Stock when requested quantity exceeds available stock", async () => {
    const requestedQuantity = 16; 

    const result = await addToCartUseCase({
      userId: currentUserId,
      modelId: testModelId,
      type: CartActionType.BULK_ADD,
      quantity: requestedQuantity,
      textPersonnalisation: "je souhaite ajouter mon prénom",
      typePersonnalisation: ""
    });

    expect(result.outOfStock).toBe(true);
    expect(result.items).toEqual([]);
  });



});
