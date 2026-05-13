import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getAdminProductFilters } from "@repo/core/usecases";
import { ProductFilterTypeAdmin, ProductState } from "@repo/core/models";
import { setup, teardown } from "./_Setup";

describe("getAdminProductFilters", () => {
    beforeEach(setup);
    afterEach(teardown);
    
    
    it("should return the correct filters", async () => {
        const filters = await getAdminProductFilters();
        expect(filters).toBeDefined();
        expect(filters.length).toBe(7);
        expect(filters[0]?.key).toBe(ProductFilterTypeAdmin.STORE);
        expect(filters[0]?.text).toBe("Magasin");
        expect(filters[0]?.values).toBeDefined();
        expect(filters[0]?.values?.length).toBe(3);
        expect(filters[0]?.values?.[0]?.id).toBe(1);
        expect(filters[0]?.values?.[0]?.name).toBe("Store 1");

        expect(filters[1]?.key).toBe(ProductFilterTypeAdmin.CATEGORY);
        expect(filters[1]?.text).toBe("Catégorie");
        expect(filters[1]?.values).toBeDefined();
        expect(filters[1]?.values?.length).toBe(3);
        expect(filters[1]?.values?.[0]?.id).toBe(1);
        expect(filters[1]?.values?.[0]?.name).toBe("Category 1");

        expect(filters[2]?.key).toBe(ProductFilterTypeAdmin.SUBCATEGORY);
        expect(filters[2]?.text).toBe("Sous-catégorie");
        expect(filters[2]?.values).toBeDefined();
        expect(filters[2]?.values?.length).toBe(3);
        expect(filters[2]?.values?.[0]?.id).toBe(1);
        expect(filters[2]?.values?.[0]?.name).toBe("SubCategory 1");

        expect(filters[3]?.key).toBe(ProductFilterTypeAdmin.BRAND);
        expect(filters[3]?.text).toBe("Marque");
        expect(filters[3]?.values).toBeDefined();
        expect(filters[3]?.values?.length).toBe(3);
        expect(filters[3]?.values?.[0]?.id).toBe(1);
        expect(filters[3]?.values?.[0]?.name).toBe("Brand 1");

        expect(filters[4]?.key).toBe(ProductFilterTypeAdmin.ATTRIBUTE);
        expect(filters[4]?.text).toBe("Attribut");
        expect(filters[4]?.children).toBeDefined();
        expect(filters[4]?.children?.length).toBe(3);
        expect(filters[4]?.children?.[0]?.key).toBe("1");
        expect(filters[4]?.children?.[0]?.text).toBe("Couleur");
        expect(filters[4]?.children?.[0]?.values).toBeDefined();
        expect(filters[4]?.children?.[0]?.values?.length).toBe(3);
        expect(filters[4]?.children?.[0]?.values?.[0]?.id).toBe(1);
        expect(filters[4]?.children?.[0]?.values?.[0]?.name).toBe("Rouge");

        expect(filters[5]?.key).toBe(ProductFilterTypeAdmin.SUPPLIER);
        expect(filters[5]?.text).toBe("Fournisseur");
        expect(filters[5]?.values).toBeDefined();
        expect(filters[5]?.values?.length).toBe(3);
        expect(filters[5]?.values?.[0]?.id).toBe(1);
        expect(filters[5]?.values?.[0]?.name).toBe("Supplier 1");

        expect(filters[6]?.key).toBe(ProductFilterTypeAdmin.STATE);
        expect(filters[6]?.text).toBe("État");
        expect(filters[6]?.values).toBeDefined();
        expect(filters[6]?.values?.length).toBe(7);
        expect(filters[6]?.values?.[0]?.id).toBe(ProductState.NORMAL);
        expect(filters[6]?.values?.[0]?.name).toBe("Normal");

    });
});