import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getStoreMenu } from "../../../src/usecases/stores/getStoreMenu";
import { SharedMemory } from "../../../src/adapters/mock";
import { Category, Store, SubCategory } from "../../../src/models/Category";

describe("getStoreMenu", () => {

    beforeEach(async () => {
        const store1: Store = { id: 1, name: "Store 1", active: 1, order: 1 }
        const store2: Store = { id: 2, name: "Store 2", active: 1, order: 2 }

        const category1: Category = { id: 1, name: "Category 1", active: 1, order: 1 }
        const category2: Category = { id: 2, name: "Category 2", active: 1, order: 2 }

        const subCategory1: SubCategory = { id: 1, name: "SubCategory 1", active: 1, order: 1 }
        const subCategory2: SubCategory = { id: 2, name: "SubCategory 2", active: 1, order: 2 }
        const subCategory3: SubCategory = { id: 3, name: "SubCategory 3", active: 1, order: 3 }

        SharedMemory.storeMenuLines = [
            { store: store1, category: category1, subCategory: subCategory1 },
            { store: store1, category: category1, subCategory: subCategory2 },
            { store: store1, category: category2, subCategory: subCategory1 },
            { store: store2, category: category1, subCategory: subCategory3 },
        ];
    });

    afterEach(async () => {
        SharedMemory.clear();
    });

    it("should return the store menu", async () => {
        const storeMenu = await getStoreMenu("fr");
        expect(storeMenu).toBeDefined();
        expect(storeMenu.length).toBe(2);
        expect(storeMenu[0]?.id).toBe(1);
        expect(storeMenu[0]?.name).toBe("Store 1");
        expect(storeMenu[0]?.categories.length).toBe(2);
        expect(storeMenu[0]?.categories[0]?.id).toBe(1);
        expect(storeMenu[0]?.categories[0]?.name).toBe("Category 1");
        expect(storeMenu[0]?.categories[0]?.subCategories.length).toBe(2);
        expect(storeMenu[0]?.categories[0]?.subCategories[0]?.id).toBe(1);
        expect(storeMenu[0]?.categories[0]?.subCategories[0]?.name).toBe("SubCategory 1");
        expect(storeMenu[0]?.categories[0]?.subCategories[1]?.id).toBe(2);
        expect(storeMenu[0]?.categories[0]?.subCategories[1]?.name).toBe("SubCategory 2");
        expect(storeMenu[1]?.id).toBe(2);
        expect(storeMenu[1]?.name).toBe("Store 2");
        expect(storeMenu[1]?.categories.length).toBe(1);
        expect(storeMenu[1]?.categories[0]?.id).toBe(1);
    });
});