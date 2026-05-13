import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPublishedCollectionUseCase } from "../../../src/usecases/collections/getPublishedCollection";
import { setup, teardown } from "./_Setup";

import { ProductStatus } from "@repo/core/models";

import { SharedMemory } from "@repo/core/adapters/mock";


describe("get Published Collection", () => {
    beforeEach(setup);
    afterEach(teardown);
    it("should return a collection", async () => {
       
  const collection = await getPublishedCollectionUseCase(1);
  expect(collection.general).toBeDefined();
        expect(collection.general.id).toBe(1);
        expect(collection.general.name).toBe("Collection 1");

        expect(collection.products.items.length).toBeGreaterThan(0);
        expect(collection.products.items.every(cp => cp.product?.status === ProductStatus.PUBLISHED)).toBe(true);

        expect(collection.products.count).toBe(collection.products.items.length);
        expect(collection.products.total).toBe(collection.products.items.length);

    })
    it("should return empty products if no published products exist", async () => {
        SharedMemory.collection_products.forEach(cp => {
            cp.product!.status = ProductStatus.DRAFT;
        });
        const result = await getPublishedCollectionUseCase(1);

        expect(result.products.items).toHaveLength(0);
        expect(result.products.count).toBe(0);
        expect(result.products.total).toBe(0);
    })
})