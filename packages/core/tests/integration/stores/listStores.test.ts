import { describe, expect, it } from "vitest";
import { listStoresUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { Store } from "@repo/core/models";

describe("listStoresUseCase", () => {
    it('should return 50 stores with a total of > 100', async () => {
        await signInTestUser(TestUser.ADMIN);
        
        let stores = await listStoresUseCase();
        expect(stores.items.length).toBeGreaterThan(0);
        expect(stores.total).toBeGreaterThan(100);
        expect(stores.count).toEqual(stores.items.length);
        expect(stores.count).toEqual(50);

        expect(stores.items[0]?.id).toBeGreaterThan(stores.items[1]?.id ?? 0);

        stores = await listStoresUseCase({sort: "asc"});
        expect(stores.items[0]?.id).toBeLessThan(stores.items[1]?.id ?? 0);

        const item = stores.items[0] as Store;
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.active).toBeDefined();
    })
  
});
