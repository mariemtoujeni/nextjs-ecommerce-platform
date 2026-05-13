import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listSubCategoriesUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";


describe("listAllSubCategories", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

    it('should return all subCategories', async () => {
        const subCategories = await listSubCategoriesUseCase();
        expect(subCategories.total).toBe(10);
        expect(subCategories.count).toBe(10);
        expect(subCategories.items).toHaveLength(10);
    })

    it('Should return only the last 2 subCategories', async () => {
        const subCategories = await listSubCategoriesUseCase({
            limit: 2,
            offset: 0,
        });
        expect(subCategories.total).toBe(10);
        expect(subCategories.count).toBe(2);
        expect(subCategories.items).toHaveLength(2);

        expect(subCategories.items[0]?.id).toBeGreaterThan(subCategories.items[1]?.id!);
    })

    it('Should return only the first 2 subCategories', async () => {
        const subCategories = await listSubCategoriesUseCase({
            limit: 2,
            offset: 0,
            sort: "asc",
        });
        expect(subCategories.total).toBe(10);
        expect(subCategories.count).toBe(2);
        expect(subCategories.items).toHaveLength(2);

        expect(subCategories.items[0]?.id).toBeLessThan(subCategories.items[1]?.id!);
    })

    it('Should return only the 2 subCategories at position 3 and 4', async () => {
        const subCategories = await listSubCategoriesUseCase({
            limit: 2,
            offset: 2,
            sort: "asc",
        });
        expect(subCategories.total).toBe(10);
        expect(subCategories.count).toBe(2);
        expect(subCategories.items).toHaveLength(2);

        expect(subCategories.items[0]?.id).toBe(303);
        expect(subCategories.items[1]?.id).toBe(304);
    });
});
