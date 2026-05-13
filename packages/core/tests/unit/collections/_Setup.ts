import { SharedMemory } from "@repo/core/adapters/mock";
import { ProductStatus, UserRoles } from "../../../src/models";

export const setup = () => {
    SharedMemory.users = [
        { id: "1", email: "admin@admin.com", user_role: UserRoles.SUPER_ADMIN, first_name: "Admin", last_name: "Admin", password: "admin", is_anonymous: false },
    ]

    SharedMemory.collections = [
        {
            id: 1,
            name: "Collection 1",
            active: 1
        },
        {
            id: 2,
            name: "Collection 2",
            active: 1
        },
        {
            id: 3,
            name: "Collection 3",
            active: 1
        }
    ];

    SharedMemory.products = [
        {
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
                name: "AquaStyle", 
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
        {
            id: 2, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 301, subCategory: { id: 301, name: "Maillots une pièce", active: 1, order: 1 }
            , brandId: 401, brand: { id: 401, name: "AquaStyle" }, isPackage: false, price: 94.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 10, weight: 3, createdAt: new Date("2024-01-02").toISOString(), updatedAt: new Date("2024-01-02").toISOString()
            , descriptions: [{ lang: "fr", title: "Maillot une pièce bleu", description: "Maillot de bain une pièce avec motif marin" }]
            , images: [{ productId: 2, url: "https://example.com/swimsuit2.jpg", attributeValueId: 2 }]
        },
        {
            id: 3, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: 1, order: 1 }
            , brandId: 402, brand: { id: 402, name: "SwimPro"}, isPackage: false, price: 79.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, weight: 3, createdAt: new Date("2024-01-03").toISOString(), updatedAt: new Date("2024-01-03").toISOString()
            , descriptions: [{ lang: "fr", title: "Bikini sport rouge", description: "Bikini deux pièces pour nage sportive" }]
            , images: [{ productId: 3, url: "https://example.com/bikini1.jpg", attributeValueId: 3 }]
        },
        {
            id: 4, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: 1, order: 1 }
            , brandId: 402, brand: { id: 402, name: "SwimPro"}, isPackage: false, price: 84.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 15, weight: 3, createdAt: new Date("2024-01-04").toISOString(), updatedAt: new Date("2024-01-04").toISOString()
            , descriptions: [{ lang: "fr", title: "Bikini sport noir", description: "Bikini deux pièces haute performance" }]
            , images: [{ productId: 4, url: "https://example.com/bikini2.jpg", attributeValueId: 4 }]
        },
        {
            id: 5, categoryId: 202, category: { id: 202, name: "Accessoires natation", active: 1, order: 1 }, subCategoryId: 303, subCategory: { id: 303, name: "Lunettes", active: 1, order: 1 }
            , brandId: 403, brand: { id: 403, name: "SwimVision"}, isPackage: false, price: 29.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 30, weight: 3, createdAt: new Date("2024-01-05").toISOString(), updatedAt: new Date("2024-01-05").toISOString()
            , descriptions: [{ lang: "fr", title: "Lunettes de natation pro", description: "Lunettes de natation professionnelles anti-buée" }]
            , images: [{ productId: 5, url: "https://example.com/goggles1.jpg", attributeValueId: 5 }]
        },
        {
            id: 6, categoryId: 202, category: { id: 202, name: "Accessoires natation", active: 1, order: 1 }, subCategoryId: 303, subCategory: { id: 303, name: "Lunettes", active: 1, order: 1 }
            , brandId: 403, brand: { id: 403, name: "SwimVision"}, isPackage: false, price: 34.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 25, weight: 3, createdAt: new Date("2024-01-06").toISOString(), updatedAt: new Date("2024-01-06").toISOString()
            , descriptions: [{ lang: "fr", title: "Lunettes compétition", description: "Lunettes de natation pour compétition" }]
            , images: [{ productId: 6, url: "https://example.com/goggles2.jpg", attributeValueId: 6 }]
        },
        {
            id: 7, categoryId: 203, category: { id: 203, name: "Accessoires de plongée", active: 1, order: 1 }, subCategoryId: 304, subCategory: { id: 304, name: "Masques", active: 1, order: 1 }
            , brandId: 404, brand: { id: 404, name: "DeepSea"}, isPackage: false, price: 49.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 10, weight: 3, createdAt: new Date("2024-01-07").toISOString(), updatedAt: new Date("2024-01-07").toISOString()
            , descriptions: [{ lang: "fr", title: "Masque de plongée", description: "Masque de plongée pour nageurs" }]
            , images: [{ productId: 7, url: "https://example.com/mask1.jpg", attributeValueId: 7 }]
        },
        {
            id: 8, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: 1, order: 1 }
            , brandId: 402, brand: { id: 402, name: "SwimPro"}, isPackage: false, price: 84.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, weight: 3, createdAt: new Date("2024-01-03").toISOString(), updatedAt: new Date("2024-01-03").toISOString()
            , descriptions: [{ lang: "fr", title: "Bikini sport rose", description: "Bikini deux pièces rose" }]
            , images: [{ productId: 4, url: "https://example.com/bikini2.jpg", attributeValueId: 4 }]
        }
    ];

    SharedMemory.collection_products = [
        {
            productId: 1,
            collectionId: 1,
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
                    name: "AquaStyle", 
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
            productId: 2,
            collectionId: 1,
            product: {
                id: 2, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 301, subCategory: { id: 301, name: "Maillots une pièce", active: 1, order: 1 }
                , brandId: 401, brand: { id: 401, name: "AquaStyle"}, isPackage: false, price: 94.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                , status: ProductStatus.PUBLISHED, customization: false, minStock: 10, weight: 3, createdAt: new Date("2024-01-02").toISOString(), updatedAt: new Date("2024-01-02").toISOString()
                , descriptions: [{ lang: "fr", title: "Maillot une pièce bleu", description: "Maillot de bain une pièce avec motif marin" }]
                , images: [{ productId: 2, url: "https://example.com/swimsuit2.jpg", attributeValueId: 2 }]
            },
            createdAt: new Date()
        },
        {
            productId: 3,
            collectionId: 1,
            product: {
                id: 3, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: 1, order: 1 }
                , brandId: 402, brand: { id: 402, name: "SwimPro"}, isPackage: false, price: 79.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, weight: 3, createdAt: new Date("2024-01-03").toISOString(), updatedAt: new Date("2024-01-03").toISOString()
                , descriptions: [{ lang: "fr", title: "Bikini sport rouge", description: "Bikini deux pièces pour nage sportive" }]
                , images: [{ productId: 3, url: "https://example.com/bikini1.jpg", attributeValueId: 3 }]
            },
            createdAt: new Date()
        },
        {
            productId: 4,
            collectionId: 2,
            product: {
                id: 4, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: 1, order: 1 }
                , brandId: 402, brand: { id: 402, name: "SwimPro"}, isPackage: false, price: 84.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                , status: ProductStatus.PUBLISHED, customization: false, minStock: 15, weight: 3, createdAt: new Date("2024-01-04").toISOString(), updatedAt: new Date("2024-01-04").toISOString()
                , descriptions: [{ lang: "fr", title: "Bikini sport noir", description: "Bikini deux pièces haute performance" }]
                , images: [{ productId: 4, url: "https://example.com/bikini2.jpg", attributeValueId: 4 }]
            },
            createdAt: new Date()
        },
        {
            productId: 5,
            collectionId: 2,
            product: {
                id: 5, categoryId: 202, category: { id: 202, name: "Accessoires natation", active: 1, order: 1 }, subCategoryId: 303, subCategory: { id: 303, name: "Lunettes", active: 1, order: 1 }
                , brandId: 403, brand: { id: 403, name: "SwimVision"}, isPackage: false, price: 29.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                , status: ProductStatus.PUBLISHED, customization: false, minStock: 30, weight: 3, createdAt: new Date("2024-01-05").toISOString(), updatedAt: new Date("2024-01-05").toISOString()
                , descriptions: [{ lang: "fr", title: "Lunettes de natation pro", description: "Lunettes de natation professionnelles anti-buée" }]
                , images: [{ productId: 5, url: "https://example.com/goggles1.jpg", attributeValueId: 5 }]
            },
            createdAt: new Date()
        },
        {
            productId: 6,
            collectionId: 2,
            product: {
                id: 6, categoryId: 202, category: { id: 202, name: "Accessoires natation", active: 1, order: 1 }, subCategoryId: 303, subCategory: { id: 303, name: "Lunettes", active: 1, order: 1 }
                , brandId: 403, brand: { id: 403, name: "SwimVision"}, isPackage: false, price: 34.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                , status: ProductStatus.PUBLISHED, customization: false, minStock: 25, weight: 3, createdAt: new Date("2024-01-06").toISOString(), updatedAt: new Date("2024-01-06").toISOString()
                , descriptions: [{ lang: "fr", title: "Lunettes compétition", description: "Lunettes de natation pour compétition" }]
                , images: [{ productId: 6, url: "https://example.com/goggles2.jpg", attributeValueId: 6 }]
            },
            createdAt: new Date()
        },
        {
            productId: 7,
            collectionId: 3,
            product: {
                id: 7, categoryId: 203, category: { id: 203, name: "Accessoires de plongée", active: 1, order: 1 }, subCategoryId: 304, subCategory: { id: 304, name: "Masques", active: 1, order: 1 }
                , brandId: 404, brand: { id: 404, name: "DeepSea"}, isPackage: false, price: 49.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
                , status: ProductStatus.PUBLISHED, customization: false, minStock: 10, weight: 3, createdAt: new Date("2024-01-07").toISOString(), updatedAt: new Date("2024-01-07").toISOString()
                , descriptions: [{ lang: "fr", title: "Masque de plongée", description: "Masque de plongée pour nageurs" }]
                , images: [{ productId: 7, url: "https://example.com/mask1.jpg", attributeValueId: 7 }]
            },
            createdAt: new Date()
        }
    ];
};

export const teardown = () => {
    SharedMemory.collections = [];
    SharedMemory.products = [];
    SharedMemory.collection_products = [];
};