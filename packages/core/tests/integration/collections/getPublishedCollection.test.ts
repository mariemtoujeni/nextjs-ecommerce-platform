import { SupabaseClient } from "@supabase/supabase-js";
import { getPublishedCollectionUseCase } from "../../../src/usecases/collections/getPublishedCollection";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";
import { ProductStatus } from "@repo/core/models";

describe("get Published Collection", () => {
  const name = "Test Collection for getById";
    let supabase: SupabaseClient;
    let collectionId: number;
    let productId: number;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const { data, error } = await supabase
      .from("collections")
      .insert({ nom: name, actif: 1 })
      .select("id")
      .single();

    if (error) throw error;
    collectionId = data.id;
    const { data: productValues, error: valuesError } = await supabase.from("produits")
        .insert({ etat_publication: "PUBLISHED", nom: "Product 1" })
        .select("id")
        .single();
    productId = productValues?.id
    

    await supabase.from("collection_products").insert({ collection_id: collectionId, product_id: productId });
  });

  afterAll(async () => {
    await supabase.from("collection_products").delete().eq("collection_id", collectionId).eq("product_id", productId);
    await supabase.from("produits").delete().eq("id", productId);
    await supabase.from("collections").delete().eq("id", collectionId);
  });

  it("should return a collection (Costumer access)", async () => {
    await signInTestUser(TestUser.CUSTOMER);
    const collection = await getPublishedCollectionUseCase(collectionId);

    expect(collection).toBeDefined();
    expect(collection.general.id).toBe(collectionId);
    expect(collection.general.name).toBe(name);
    expect(collection.general.active).toBe(1);
    expect(collection.products.items.every(cp => cp.product?.status === ProductStatus.PUBLISHED)).toBe(true);
  });
});
