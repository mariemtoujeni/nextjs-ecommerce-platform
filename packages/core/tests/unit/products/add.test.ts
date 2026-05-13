import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { OnlineShop, ProductAdd, ProductStatus } from "../../../src/models/Product";
import { addProductUseCase } from "../../../src/usecases/products/add";
import { setup, teardown } from "./_Setup";
import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";
import { getInjection } from "../../../src/types/di";


describe("addProduct", () => {
    const productAdd: ProductAdd = {
        manufacturerReference: "Test Manufacturer Reference",
        supplierReference: "Test Supplier Reference",
        buyPriceWithoutVat: 100,
        barCode: "Test Bar Code",
        categoryId: 1,
        subCategoryId: 1,
        brandId: 1,
        isPackage: false,
        price: 100,
        vatRate: 20,
        productAttributes: [
            {
                id: 1,
                name: "Test Attribute",
                values: [{ id: 1, name: "Test Value"}, { id: 2, name: "Test Value 2"}]
            },
            {
                id: 2,
                name: "Test Attribute 2",
                values: [{ id: 3, name: "Test Value 3"}, { id: 4, name: "Test Value 4"}]
            }, 
            {
                id: 3,
                name: "Test Attribute 3",
                values: [{ id: 5, name: "Test Value 5"}, { id: 6, name: "Test Value 6"}]
            }
        ],
        onlineShops: [OnlineShop.NATAQUASHOP, OnlineShop.CRAZYSWIM],
        stores: [1, 2],
        collections: [1, 2],
        minStock: 10,
        weight: 100,
        isGiftCard: true,
        giftCardDuration: 10,
        descriptions: [{
            title: "Test Title",
            lang: "fr",
            description: "Test Description",
        }],
        supplierId: 1,
        customizations: [{
            description: "Test Customization",
            price: 100,
        }],
        customizable: true,
    }

    const expectedAttributeValues = [
        [1, 3, 5],
        [1, 3, 6],
        [1, 4, 5],
        [1, 4, 6],
        [2, 3, 5],
        [2, 3, 6],
        [2, 4, 5],
        [2, 4, 6]
      ]

    beforeEach(setup);
    afterEach(teardown);

    it("should add a product", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const nbProdcuts = SharedMemory.products.length;
        const product = await addProductUseCase(productAdd);
        expect(SharedMemory.products.length).toBe(nbProdcuts + 1);
        expect(product).toBeDefined();
        expect(product.modeles).toBeDefined();
        expect(product.modeles?.length).toBe(8);
        
        product.modeles?.forEach((model) => {
            const modelAttributeIds = model.attributValues?.map(av => av.idAttributValue).sort();
            expect(expectedAttributeValues).toContainEqual(modelAttributeIds);
        });

        // Verify all expected combinations are present
        const actualAttributeValues = product.modeles?.map(model => 
            model.attributValues?.map(av => av.idAttributValue).sort()
        );
        expectedAttributeValues.forEach(combination => {
            expect(actualAttributeValues).toContainEqual(combination);
        });

        const onlineShops = SharedMemory.productOnlineShopes.filter(pos => pos.productId === product.id);
        expect(onlineShops.length).toBe(2);
        expect(onlineShops.map(pos => pos.onlineShop)).toEqual([OnlineShop.NATAQUASHOP, OnlineShop.CRAZYSWIM]);

        await authService.signOut();
    });
});