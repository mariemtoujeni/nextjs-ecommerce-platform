import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateCollectionUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { ProductStatus } from "../../../src/models";
import { getInjection } from "../../../src/types/di";

describe("updateCollectionUseCase", () => {
    beforeEach(setup);
    afterEach(teardown);

    it("should update a collection", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const collection = await updateCollectionUseCase(1, { 
            general: { 
                id: 1,
                name: "Update Collection 1", 
                active: 1 
            },
            products: [
                {                         
                    collectionId: 1,
                    productId: 1,
                    product: {
                        id: 1, 
                        categoryId: 201, 
                        category: { 
                            id: 201, 
                            name: "Maillots de bain", 
                            active: 1, order: 1 
                        }, 
                        subCategoryId: 301, 
                        subCategory: { 
                            id: 301, 
                            name: "Maillots une pièce", 
                            active: 1, order: 1 
                        }
                        , 
                        brandId: 401, 
                        brand: { 
                            id: 401, 
                            name: "AquaStyle"
                        }, 
                        isPackage: false, 
                        price: 89.99, 
                        vatRate: 20, 
                        isGiftCard: false, 
                        giftCardDuration: 0, 
                        status: ProductStatus.PUBLISHED, 
                        customization: false, 
                        minStock: 15, 
                        weight: 3,
                        createdAt: new Date("2024-01-01").toISOString(), 
                        updatedAt: new Date("2024-01-01").toISOString(),
                        descriptions: [{ lang: "fr", title: "Maillot une pièce noir", description: "Maillot de bain une pièce élégant et confortable" }],
                        images: [{ productId: 1, url: "https://example.com/swimsuit1.jpg", attributeValueId: 1 }]
                    },
                    createdAt: new Date()                        
                },
                {
                    collectionId: 1,
                    productId: 2,
                    product: {
                        id: 2, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 301, subCategory: { id: 301, name: "Maillots une pièce", active: 1, order: 1 }
                        , brandId: 401, brand: { id: 401, name: "AquaStyle" }, isPackage: false, price: 94.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                        , status: ProductStatus.PUBLISHED, customization: false, minStock: 10, weight: 3, createdAt: new Date("2024-01-02").toISOString(), updatedAt: new Date("2024-01-02").toISOString()
                        , descriptions: [{ lang: "fr", title: "Maillot une pièce bleu", description: "Maillot de bain une pièce avec motif marin" }]
                        , images: [{ productId: 2, url: "https://example.com/swimsuit2.jpg", attributeValueId: 2 }]
                    },
                    createdAt: new Date()
                },
                {
                    collectionId: 1,
                    productId: 3,
                    product: {
                        id: 3, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: 1, order: 1 }
                        , brandId: 402, brand: { id: 402, name: "SwimPro" }, isPackage: false, price: 79.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                        , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, weight: 3, createdAt: new Date("2024-01-03").toISOString(), updatedAt: new Date("2024-01-03").toISOString()
                        , descriptions: [{ lang: "fr", title: "Bikini sport rouge", description: "Bikini deux pièces pour nage sportive" }]
                        , images: [{ productId: 3, url: "https://example.com/bikini1.jpg", attributeValueId: 3 }]
                    },
                    createdAt: new Date()
                }
            ]
        });
        expect(collection.general.id).toBe(1);
        expect(collection.general.name).toBe("Update Collection 1");
        expect(collection.general.active).toBe(1);
        expect(collection.products.items.length).toBe(3);
    });

    it("should add a product to a collection if it doesn't exist products array", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const collection = await updateCollectionUseCase(1, { 
            general: { 
                id: 1,
                name: "Update Collection 1", 
                active: 1 
            },
            products: [
                {                         
                    collectionId: 1,
                    productId: 1,
                    product: {
                        id: 1, 
                        categoryId: 201, 
                        category: { 
                            id: 201, 
                            name: "Maillots de bain", 
                            active: 1, order: 1 
                        }, 
                        subCategoryId: 301, 
                        subCategory: { 
                            id: 301, 
                            name: "Maillots une pièce", 
                            active: 1, order: 1 
                        }
                        , 
                        brandId: 401, 
                        brand: { 
                            id: 401, 
                            name: "AquaStyle"
                        }, 
                        isPackage: false, 
                        price: 89.99, 
                        vatRate: 20, 
                        isGiftCard: false, 
                        giftCardDuration: 0, 
                        status: ProductStatus.PUBLISHED, 
                        customization: false, 
                        minStock: 15, 
                        weight: 3,
                        createdAt: new Date("2024-01-01").toISOString(), 
                        updatedAt: new Date("2024-01-01").toISOString(),
                        descriptions: [{ lang: "fr", title: "Maillot une pièce noir", description: "Maillot de bain une pièce élégant et confortable" }],
                        images: [{ productId: 1, url: "https://example.com/swimsuit1.jpg", attributeValueId: 1 }]
                    },
                    createdAt: new Date()                        
                },
                {
                    collectionId: 1,
                    productId: 2,
                    product: {
                        id: 2, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 301, subCategory: { id: 301, name: "Maillots une pièce", active: 1, order: 1 }
                        , brandId: 401, brand: { id: 401, name: "AquaStyle" }, isPackage: false, price: 94.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                        , status: ProductStatus.PUBLISHED, customization: false, minStock: 10, weight: 3, createdAt: new Date("2024-01-02").toISOString(), updatedAt: new Date("2024-01-02").toISOString()
                        , descriptions: [{ lang: "fr", title: "Maillot une pièce bleu", description: "Maillot de bain une pièce avec motif marin" }]
                        , images: [{ productId: 2, url: "https://example.com/swimsuit2.jpg", attributeValueId: 2 }]
                    },
                    createdAt: new Date()
                },
                {
                    collectionId: 1,
                    productId: 3,
                    product: {
                        id: 3, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: 1, order: 1 }
                        , brandId: 402, brand: { id: 402, name: "SwimPro" }, isPackage: false, price: 79.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                        , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, weight: 3, createdAt: new Date("2024-01-03").toISOString(), updatedAt: new Date("2024-01-03").toISOString()
                        , descriptions: [{ lang: "fr", title: "Bikini sport rouge", description: "Bikini deux pièces pour nage sportive" }]
                        , images: [{ productId: 3, url: "https://example.com/bikini1.jpg", attributeValueId: 3 }]
                    },
                    createdAt: new Date()
                },
                {
                    collectionId: 1,
                    productId: 8,
                    product: {
                        id: 8, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: 1, order: 1 }
                        , brandId: 402, brand: { id: 402, name: "SwimPro" }, isPackage: false, price: 84.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                        , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, weight: 3, createdAt: new Date("2024-01-03").toISOString(), updatedAt: new Date("2024-01-03").toISOString()
                        , descriptions: [{ lang: "fr", title: "Bikini sport rose", description: "Bikini deux pièces rose" }]
                        , images: [{ productId: 4, url: "https://example.com/bikini2.jpg", attributeValueId: 4 }]
                    },
                    createdAt: new Date()
                }
            ]
        });
        expect(collection.products.total).toBe(4);        
        expect(collection.products.items[0]?.product?.id).toBe(1);
        expect(collection.products.items[1]?.product?.id).toBe(2);
        expect(collection.products.items[2]?.product?.id).toBe(3);
        expect(collection.products.items[3]?.product?.id).toBe(8);
        expect(collection.products.items[3]?.product?.descriptions[0]?.title).toBe("Bikini sport rose");
        expect(collection.products.items[3]?.product?.descriptions[0]?.description).toBe("Bikini deux pièces rose");
        expect(collection.products.items[3]?.product?.images[0]?.url).toBe("https://example.com/bikini2.jpg");
    });

    it("should remove a product from a collection if it doesn't exist in the products array", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const collection = await updateCollectionUseCase(1, { 
            general: { 
                id: 1,
                name: "Update Collection 1", 
                    active: 1 
            },
            products: [
                {
                    collectionId: 1,
                    productId: 2,
                    product: {
                        id: 2, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 301, subCategory: { id: 301, name: "Maillots une pièce", active: 1, order: 1 }
                        , brandId: 401, brand: { id: 401, name: "AquaStyle" }, isPackage: false, price: 94.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                        , status: ProductStatus.PUBLISHED, customization: false, minStock: 10, weight: 3, createdAt: new Date("2024-01-02").toISOString(), updatedAt: new Date("2024-01-02").toISOString()
                        , descriptions: [{ lang: "fr", title: "Maillot une pièce bleu", description: "Maillot de bain une pièce avec motif marin" }]
                        , images: [{ productId: 2, url: "https://example.com/swimsuit2.jpg", attributeValueId: 2 }]
                    },
                    createdAt: new Date()
                },
                {
                    collectionId: 1,
                    productId: 3,
                    product: {
                        id: 3, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: 1, order: 1 }
                        , brandId: 402, brand: { id: 402, name: "SwimPro" }, isPackage: false, price: 79.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                        , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, weight: 3, createdAt: new Date("2024-01-03").toISOString(), updatedAt: new Date("2024-01-03").toISOString()
                        , descriptions: [{ lang: "fr", title: "Bikini sport rouge", description: "Bikini deux pièces pour nage sportive" }]
                        , images: [{ productId: 3, url: "https://example.com/bikini1.jpg", attributeValueId: 3 }]
                    },
                    createdAt: new Date()
                },
            ]
        });
        expect(collection.products.items.length).toBe(2);
        expect(collection.products.items[0]?.product?.id).toBe(2);
        expect(collection.products.items[1]?.product?.id).toBe(3);
    });
    
    it("should return an error if the collection doesn't exist", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(updateCollectionUseCase(999, { 
            general: { 
                id: 999,
                name: "Update Collection 1", 
                active: 1 
            },
            products: []
        })).rejects.toThrow('Collection with ID 999 not found');
    });

    // Can not test this because the product repository is not implemented yet
    // it("should return an error if the product doesn't exist", async () => {
    //
    //     await expect(updateCollectionUseCase(1, { 
    //         general: { 
    //             id: 1,
    //             name: "Update Collection 1", 
    //             active: true     
    //         },
    //         products: [
    //             {                         
    //                 collectionId: 1,
    //                 productId: 1,
    //                 product: {
    //                     id: 1, 
    //                     categoryId: 201, 
    //                     category: { 
    //                         id: 201, 
    //                         name: "Maillots de bain", 
    //                         active: true, order: 1 
    //                     }, 
    //                     subCategoryId: 301, 
    //                     subCategory: { 
    //                         id: 301, 
    //                         name: "Maillots une pièce", 
    //                         active: true, order: 1 
    //                     }
    //                     , 
    //                     brandId: 401, 
    //                     brand: { 
    //                         id: 401, 
    //                         name: "AquaStyle", 
    //                         active: true, 
    //                         order: 1 
    //                     }, 
    //                     isPackage: false, 
    //                     price: 89.99, 
    //                     vatRate: 20, 
    //                     isGiftCard: false, 
    //                     giftCardDuration: 0, 
    //                     status: ProductStatus.PUBLISHED, 
    //                     customization: false, 
    //                     minStock: 15, 
    //                     createdAt: new Date("2024-01-01"), 
    //                     updatedAt: new Date("2024-01-01"),
    //                     descriptions: [{ lang: "fr", title: "Maillot une pièce noir", description: "Maillot de bain une pièce élégant et confortable" }],
    //                     images: [{ productId: 1, url: "https://example.com/swimsuit1.jpg", attributeValueId: 1 }]
    //                 },
    //                 createdAt: new Date()                        
    //             },
    //             {
    //                 collectionId: 1,
    //                 productId: 2,
    //                 product: {
    //                     id: 2, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: true, order: 1 }, subCategoryId: 301, subCategory: { id: 301, name: "Maillots une pièce", active: true, order: 1 }
    //                     , brandId: 401, brand: { id: 401, name: "AquaStyle", active: true, order: 1 }, isPackage: false, price: 94.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
    //                     , status: ProductStatus.PUBLISHED, customization: false, minStock: 10, createdAt: new Date("2024-01-02"), updatedAt: new Date("2024-01-02")
    //                     , descriptions: [{ lang: "fr", title: "Maillot une pièce bleu", description: "Maillot de bain une pièce avec motif marin" }]
    //                     , images: [{ productId: 2, url: "https://example.com/swimsuit2.jpg", attributeValueId: 2 }]
    //                 },
    //                 createdAt: new Date()
    //             },
    //             {
    //                 collectionId: 1,
    //                 productId: 3,
    //                 product: {
    //                     id: 3, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: true, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: true, order: 1 }
    //                     , brandId: 402, brand: { id: 402, name: "SwimPro", active: true, order: 1 }, isPackage: false, price: 79.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
    //                     , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, createdAt: new Date("2024-01-03"), updatedAt: new Date("2024-01-03")
    //                     , descriptions: [{ lang: "fr", title: "Bikini sport rouge", description: "Bikini deux pièces pour nage sportive" }]
    //                     , images: [{ productId: 3, url: "https://example.com/bikini1.jpg", attributeValueId: 3 }]
    //                 },
    //                 createdAt: new Date()
    //             },
    //             {
    //                 collectionId: 1,
    //                 productId: 999,
    //                 product: {
    //                     id: 999, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: true, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: true, order: 1 }
    //                     , brandId: 402, brand: { id: 402, name: "SwimPro", active: true, order: 1 }, isPackage: false, price: 84.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
    //                     , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, createdAt: new Date("2024-01-03"), updatedAt: new Date("2024-01-03")
    //                     , descriptions: [{ lang: "fr", title: "Bikini sport rose", description: "Bikini deux pièces rose" }]
    //                     , images: [{ productId: 4, url: "https://example.com/bikini2.jpg", attributeValueId: 4 }]
    //                 },
    //                 createdAt: new Date()
    //             }
    //         ]
    //     })).rejects.toThrow('Product with ID 999 not found');
    // });
});