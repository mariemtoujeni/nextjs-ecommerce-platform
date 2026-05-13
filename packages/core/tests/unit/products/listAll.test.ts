import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllProductsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe('listAllProducts', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return all products', async () => {
        const products = await listAllProductsUseCase();
        expect(products.total).toBe(10);
        expect(products.count).toBe(10);
        expect(products.items).toHaveLength(10);
    })

    it('Should return only the last 2 products', async () => {
        const products = await listAllProductsUseCase({
            limit: 2,
            offset: 0,
        });
        expect(products.total).toBe(10);
        expect(products.count).toBe(2);
        expect(products.items).toHaveLength(2);

        expect(products.items[0]?.id).toBeGreaterThan(products.items[1]?.id as number);
    })

    it('Should return only the first 2 products', async () => {
        const products = await listAllProductsUseCase({
            limit: 2,
            offset: 0,
            sort: "asc",
        });
        expect(products.total).toBe(10);
        expect(products.count).toBe(2);
        expect(products.items).toHaveLength(2);

        expect(products.items[0]?.id).toBeLessThan(products.items[1]?.id as number);
    })

    it('Should return only the 2 products at position 3 and 4', async () => {
        const products = await listAllProductsUseCase({
            limit: 2,
            offset: 2,
            sort: "asc",
        });
        expect(products.total).toBe(10);
        expect(products.count).toBe(2);
        expect(products.items).toHaveLength(2);

        expect(products.items[0]?.id).toBe(3);
        expect(products.items[1]?.id).toBe(4);
    })
})