import { expect, describe, it } from "vitest"
import { listAllProductsUseCase } from "@repo/core/usecases"
import { signInTestUser, TestUser } from "../utils"
import { FilterAttributeInput, ProductStatus } from "@repo/core/models"

describe('listAllProducts', () => {
    
    it('should return 50 products with a total of > 9000', async () => {
        await signInTestUser(TestUser.ADMIN);

        let products = await listAllProductsUseCase();
        expect(products.items.length).toBeGreaterThan(0);
        expect(products.total).toBeGreaterThan(8000);
        expect(products.count).toEqual(products.items.length);
        expect(products.count).toEqual(50);

        expect(products.items[0]?.id).toBeGreaterThan(products.items[1]?.id ?? 0);

        products = await listAllProductsUseCase({sort: "asc"});
        expect(products.items[0]?.id).toBeLessThan(products.items[1]?.id ?? 0);

        const item = products.items[0];
        expect(item?.brandId).toBeDefined();
        expect(item?.categoryId).toBeDefined();
        expect(item?.category).toBeDefined();
        expect(item?.subCategoryId).toBeDefined();
        expect(item?.subCategory).toBeDefined();
        expect(item?.descriptions).toBeDefined();
        expect(item?.descriptions.length).toBeGreaterThan(0);
        expect(item?.id).toBeDefined();
        expect(item?.id).toBeGreaterThan(0);
        expect(item?.price).toBeDefined();
        expect(item?.images).toBeDefined();
    })

    it('Should filters products', async () => {
        await signInTestUser(TestUser.ADMIN);

        let products = await listAllProductsUseCase({
           search: "bonnet"
        })
        expect(products.items.length).toBeGreaterThan(0);
        expect(products.items.every(item => item.descriptions.some(description => description.title.toLocaleLowerCase().includes("bonnet")))).toBe(true);

        products = await listAllProductsUseCase({
            search: "15578"
         })
         expect(products.items.length).toBeGreaterThan(0);
         expect(products.items.every(item => item.id === 15578)).toBe(true);

        products = await listAllProductsUseCase({
            filters: [{
                key: "STORE",
                values: ["1"]
            }]
        })
        expect(products.items.length).toBeGreaterThan(0);
        expect(products.items.every(item => item.stores?.every(magasin => magasin.id === 1))).toBe(true);

        products = await listAllProductsUseCase({
            filters: [{
                key: "CATEGORY",
                values: ["1", "2"]
            }]
        })
        expect(products.items.length).toBeGreaterThan(0);
        expect(products.items.every(item => item.categoryId === 1 || item.categoryId === 2)).toBe(true);

        products = await listAllProductsUseCase({
            filters: [{
                key: "SUBCATEGORY",
                values: ["1", "2"]
            }]
        })
        expect(products.items.length).toBeGreaterThan(0);
        expect(products.items.every(item => item.subCategoryId === 1 || item.subCategoryId === 2)).toBe(true);

        products = await listAllProductsUseCase({
            filters: [{
                key: "BRAND",
                values: ["1", "2"]
            }]
        })
        expect(products.items.length).toBeGreaterThan(0);
        expect(products.items.every(item => item.brandId === 1 || item.brandId === 2)).toBe(true);

        products = await listAllProductsUseCase({
            filters: [{
                key: "SUPPLIER",
                values: ["1", "2"]
            }]
        })
        expect(products.items.length).toBeGreaterThan(0);
        expect(products.items.every(item => item.supplierId === 1 || item.supplierId === 2)).toBe(true);

        products = await listAllProductsUseCase({
            filters: [{
                key: "STATE",
                values: ["PUBLIE", "DESACTIVE"]
            }]
        })  
        expect(products.items.length).toBeGreaterThan(0);
        expect(products.items.every(item => item.status === ProductStatus.PUBLISHED || item.status === ProductStatus.DEACTIVATED)).toBe(true);

        products = await listAllProductsUseCase({
            filters: [{
                key: "ATTRIBUTE",
                values: [{
                    key: "COLOR",
                    values: ["582", "2324"] // Orange, Blue/Grey
                }]
            }]
        })
        expect(products.items.length).toBeGreaterThan(0);
        // expect(products.items.every(item => {
        //     const result = item.productAttributes?.some(attribute => attribute.values.some(value => value.id === 582 || value.id === 2324))
        //     return result
        // })).toBe(true);
    })

    it('Should filters products with filterAttributeInput', async () => {
        await signInTestUser(TestUser.CUSTOMER);

        const filter : FilterAttributeInput = {
            id_attribute: 0,
            attribute_value_ids: [ 9 ],
            attribute_value: [ 'CRAZYSWIM' ],
            type: 'brand'
        }

        const products = await listAllProductsUseCase(undefined, [filter]);

        expect(products.items.length).toBeGreaterThan(0);
    })
})