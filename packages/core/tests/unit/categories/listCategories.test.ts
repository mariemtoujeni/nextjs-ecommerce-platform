import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listCategoriesUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe("listAllCategories", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

    it('should return all categories', async () => {
        const categories = await listCategoriesUseCase();
        expect(categories.total).toBe(10);
        expect(categories.count).toBe(10);
        expect(categories.items).toHaveLength(10);
    })

    it('Should return only the last 2 categories', async () => {
        const categories = await listCategoriesUseCase({
            limit: 2,
            offset: 0,
        });
        expect(categories.total).toBe(10);
        expect(categories.count).toBe(2);
        expect(categories.items).toHaveLength(2);

        expect(categories.items[0]?.id).toBeGreaterThan(categories.items[1]?.id ?? 0);
    })

    it('Should return only the first 2 categories', async () => {
        const categories = await listCategoriesUseCase({
            limit: 2,
            offset: 0,
            sort: "asc",
        });
        expect(categories.total).toBe(10);
        expect(categories.count).toBe(2);
        expect(categories.items).toHaveLength(2);

        expect(categories.items[0]?.id).toBeLessThan(categories.items[1]?.id ?? 0);
    })

    it('Should return only the 2 categories at position 3 and 4', async () => {
        const categories = await listCategoriesUseCase({
            limit: 2,
            offset: 2,
            sort: "asc",
        });
        expect(categories.total).toBe(10);
        expect(categories.count).toBe(2);
        expect(categories.items).toHaveLength(2);

        expect(categories.items[0]?.id).toBe(103);
        expect(categories.items[1]?.id).toBe(104);
    });
});
