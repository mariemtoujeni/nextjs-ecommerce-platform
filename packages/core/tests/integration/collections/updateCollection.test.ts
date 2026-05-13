import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { updateCollectionUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";
import { Product, ProductStatus } from "@repo/core/models";

describe("updateCollectionUseCase", () => {
  let supabase: SupabaseClient;

  const collectionId = 888001;
  const productId = 955201;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const { error: productError } = await supabase.from("produits").upsert([
      {
        id: productId,
        id_categorie: 1,
        id_sous_categories: 1,
        id_marque: 1,
        is_pack: false,
        prix_vente_ht: 516.67,
        prix_vente_ttc: 999,
        tva: 20,
        poids: 3,
        cheque_cadeau: false,
        etat_publication: ProductStatus.PUBLISHED,
        personnalisation: false,
        stock_min: 0,
        created_at: new Date("2024-01-04T11:01:51Z"),
        updated_at: new Date("2024-11-01T19:22:37.975Z"),
      },
    ]);

    if (productError) throw productError;
    const { error: collectionError } = await supabase.from("collections").upsert([
      {
        id: collectionId,
        nom: "Original Test Collection",
        actif: 1,
      },
    ]);
    if (collectionError) throw collectionError;


    const { error: error } = await supabase.from("collection_produits").upsert([
      {
        id_produit: productId,
        id_collection: collectionId,
      },
    ]);
    if (error) throw error;


  });

  afterAll(async () => {
    await supabase.from("collection_produits").delete().eq("id_collection", collectionId);
    await supabase.from("collections").delete().eq("id", collectionId);
    await supabase.from("produits").delete().eq("id", productId);
  });

  it("should add a product to a collection", async () => {
    const result = await updateCollectionUseCase(collectionId, {
      general: {
        id: collectionId,
        name: `Test Collection with id ${collectionId}`,
        active: 1,
      },
      products: [
        {
          collectionId: collectionId,
          productId: productId,
          product: {
            id: productId,
            categoryId: 1,
            category: { id: 1, name: "Femme", active: 1, order: 1 },
            subCategoryId: 1,
            subCategory: { id: 1, name: "Compétition", active: 1, order: 0 },
            brandId: 1,
            brand: { id: 1, name: "ARENA" },
            isPackage: false,
            price: 516.67,
            vatRate: 20,
            isGiftCard: false,
            giftCardDuration: 0,
            status: ProductStatus.PUBLISHED,
            customization: false,
            minStock: 0,
            weight: 3,
            createdAt: new Date("2024-01-04T11:01:51Z").toISOString(),
            updatedAt: new Date("2024-11-01T19:22:37.975Z").toISOString(),
            descriptions: [
              { lang: "fr", title: "Produit Test", description: "description produit test" },
              { lang: "en", title: "Test product", description: "Test product description" },
            ],
            images: [
              { productId: productId, url: "https://example.com/swimsuit2.jpg", attributeValueId: 2 },
            ],
          },
          createdAt: new Date(),
        },
      ],
    });

    expect(result.general.name).toBe(`Test Collection with id ${collectionId}`);
    expect(result.products.items.length).toBe(1);

    const product = result.products.items[0]?.product as Product;
    expect(product.id).toBe(productId);
    expect(product.categoryId).toBe(1);
    expect(product.category.name).toBe("Femme");
    expect(product.subCategoryId).toBe(1);
    expect(product.subCategory.name).toBe("Compétition");
    expect(product.brandId).toBe(1);
    expect(product.brand.name).toBe("ARENA");
    expect(product.price).toBe(516.67);
    expect(product.minStock).toBe(0);
  });
});
