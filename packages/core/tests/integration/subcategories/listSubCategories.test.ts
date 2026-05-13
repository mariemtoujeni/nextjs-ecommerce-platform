import { describe, expect, it } from "vitest";
import { listSubCategoriesUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { SubCategory } from "@repo/core/models";

describe("listSubCategoriesUseCase", () => {
    it('should return 50 subcategories with a total of > 80', async () => {
        await signInTestUser(TestUser.ADMIN);
        let subcategories = await listSubCategoriesUseCase();
        expect(subcategories.items.length).toBeGreaterThan(0);
        expect(subcategories.total).toBeGreaterThan(80);
        expect(subcategories.count).toEqual(subcategories.items.length);
        expect(subcategories.count).toEqual(50);

        expect(subcategories.items[0]?.id).toBeGreaterThan(subcategories.items[1]?.id ?? 0);

        subcategories = await listSubCategoriesUseCase({sort: "asc"});
        expect(subcategories.items[0]?.id).toBeLessThan(subcategories.items[1]?.id ?? 0);

        const item = subcategories.items[0] as SubCategory;
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.active).toBeDefined();
        expect(item.order).toBeDefined();
    })
  
});
