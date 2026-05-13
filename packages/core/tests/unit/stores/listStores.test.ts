import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listStoresUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";


describe("listAllStores", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

    it('should return all stores', async () => {
        const stores = await listStoresUseCase();
        expect(stores.total).toBe(10);
        expect(stores.count).toBe(10);
        expect(stores.items).toHaveLength(10);
    })

    it('Should return only the last 2 stores', async () => {
        const stores = await listStoresUseCase({
            limit: 2,
            offset: 0,
        });
        expect(stores.total).toBe(10);
        expect(stores.count).toBe(2);
        expect(stores.items).toHaveLength(2);

        expect(stores.items[0]?.id).toBeGreaterThan(stores.items[1]?.id!);
    })

    it('Should return only the first 2 stores', async () => {
        const stores = await listStoresUseCase({
            limit: 2,
            offset: 0,
            sort: "asc",
        });
        expect(stores.total).toBe(10);
        expect(stores.count).toBe(2);
        expect(stores.items).toHaveLength(2);

        expect(stores.items[0]?.id).toBeLessThan(stores.items[1]?.id!);
    })

    it('Should return only the 2 stores at position 3 and 4', async () => {
        const stores = await listStoresUseCase({
            limit: 2,
            offset: 2,
            sort: "asc",
        });
        expect(stores.total).toBe(10);
        expect(stores.count).toBe(2);
        expect(stores.items).toHaveLength(2);

        expect(stores.items[0]?.id).toBe(603);
        expect(stores.items[1]?.id).toBe(604);
    });
});
