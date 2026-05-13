import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getProductsBySousCategorie } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe('getProductsBySousCategorie', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('should return products by subCategoryId excluding the current product', async () => {
         const productId = 2; // Ce produit doit exister dans les données insérées par `setup`
    
    const products = await getProductsBySousCategorie(productId);

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    
    if (products?.length > 0) {
      
      const subCategoryId = products[0]?.subCategoryId;

      for (const product of products) {
        
        expect(product.subCategoryId).toBe(subCategoryId);
      }
    }
  });
});