import { describe, expect, it } from "vitest";
import { listCategoriesUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";

describe("listCategoriesUseCase", () => {
    it('should return 50 categories with a total of > 50', async () => {
        await signInTestUser(TestUser.ADMIN);

        let categories = await listCategoriesUseCase();
        expect(categories.items.length).toBeGreaterThan(0);
        expect(categories.total).toBeGreaterThan(50);
        expect(categories.count).toEqual(categories.items.length);
        expect(categories.count).toEqual(50);

        expect(categories.items[0]?.id).toBeGreaterThan(categories.items[1]?.id ?? 0);

        categories = await listCategoriesUseCase({sort: "asc"});
        expect(categories.items[0]?.id).toBeLessThan(categories.items[1]?.id ?? 0);

        const item = categories.items[0];
        expect(item?.id).toBeDefined();
        expect(item?.name).toBeDefined();
        expect(item?.active).toBeDefined();
        expect(item?.order).toBeDefined();
    })
  
});
