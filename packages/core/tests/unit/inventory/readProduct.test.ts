import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllInventoriesUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe('listAllInventories', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return all inventories', async () => {
        const inventories = await listAllInventoriesUseCase();
        expect(inventories.total).toBe(6);
        expect(inventories.count).toBe(6);
        expect(inventories.items).toHaveLength(6);
    })

    it('Should return only the last 2 inventories', async () => {
        const inventories = await listAllInventoriesUseCase({
            limit: 2,
            offset: 0,
        });
        expect(inventories.total).toBe(6);
        expect(inventories.count).toBe(2);
        expect(inventories.items).toHaveLength(2);

        expect(inventories.items[0]?.id).toBeGreaterThan(inventories.items[1]?.id as number);
    })

    it('Should return only the first 2 inventories', async () => {
        const inventories = await listAllInventoriesUseCase({
            limit: 2,
            offset: 0,
            sort: "asc",
        });
        expect(inventories.total).toBe(6);
        expect(inventories.count).toBe(2);
        expect(inventories.items).toHaveLength(2);

        expect(inventories.items[0]?.id).toBeLessThan(inventories.items[1]?.id as number);
    })

    it('Should return only the 2 inventories at position 3 and 4', async () => {
        const inventories = await listAllInventoriesUseCase({
            limit: 2,
            offset: 2,
            sort: "asc",
        });
        expect(inventories.total).toBe(6);
        expect(inventories.count).toBe(2);
        expect(inventories.items).toHaveLength(2);

        expect(inventories.items[0]?.id).toBe(3);
        expect(inventories.items[1]?.id).toBe(4);
    })
})