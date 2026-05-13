import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";
import { OnlineShop, ProductState, ProductStatus, UserRoles } from "../../../src/models";

export const setup = () => {
    SharedMemory.users = [
        { id: "1", email: "admin@admin.com", user_role: UserRoles.SUPER_ADMIN, first_name: "Admin", last_name: "Admin", password: "admin", is_anonymous: false },
    ]
    SharedMemory.products = [
        {
            id: 1, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 301, subCategory: { id: 301, name: "Maillots une pièce", active: 1, order: 1 }
            , brandId: 401, brand: { id: 401, name: "AquaStyle" }, isPackage: false, price: 89.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 15, weight: 3, createdAt: new Date("2024-01-01").toISOString(), updatedAt: new Date("2024-01-01").toISOString()
            , descriptions: [{ lang: "fr", title: "Maillot une pièce noir", description: "Maillot de bain une pièce élégant et confortable" }]
            , images: [{ productId: 1, url: "https://example.com/swimsuit1.jpg", attributeValueId: 1 }]
            , productAttributes: [{ id: 1, name: "Couleur", values: [{ id: 1, name: "Rouge" }] }, { id: 2, name: "Taille", values: [{ id: 2, name: "S" }, { id: 3, name: "M" }, { id: 4, name: "L" }] }]
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
            , brandId: 402, brand: { id: 402, name: "SwimPro" }, isPackage: false, price: 79.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, weight: 3, createdAt: new Date("2024-01-03").toISOString(), updatedAt: new Date("2024-01-03").toISOString()
            , descriptions: [{ lang: "fr", title: "Bikini sport rouge", description: "Bikini deux pièces pour nage sportive" }]
            , images: [{ productId: 3, url: "https://example.com/bikini1.jpg", attributeValueId: 3 }]
        },
        {
            id: 4, categoryId: 201, category: { id: 201, name: "Maillots de bain", active: 1, order: 1 }, subCategoryId: 302, subCategory: { id: 302, name: "Maillots deux pièces", active: 1, order: 1 }
            , brandId: 402, brand: { id: 402, name: "SwimPro" }, isPackage: false, price: 84.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 15, weight: 3, createdAt: new Date("2024-01-04").toISOString(), updatedAt: new Date("2024-01-04").toISOString()
            , descriptions: [{ lang: "fr", title: "Bikini sport noir", description: "Bikini deux pièces haute performance" }]
            , images: [{ productId: 4, url: "https://example.com/bikini2.jpg", attributeValueId: 4 }]
        },
        {
            id: 5, categoryId: 202, category: { id: 202, name: "Accessoires natation", active: 1, order: 1 }, subCategoryId: 303, subCategory: { id: 303, name: "Lunettes", active: 1, order: 1 }
            , brandId: 403, brand: { id: 403, name: "SwimVision" }, isPackage: false, price: 29.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 30, weight: 3, createdAt: new Date("2024-01-05").toISOString(), updatedAt: new Date("2024-01-05").toISOString()
            , descriptions: [{ lang: "fr", title: "Lunettes de natation pro", description: "Lunettes de natation professionnelles anti-buée" }]
            , images: [{ productId: 5, url: "https://example.com/goggles1.jpg", attributeValueId: 5 }]
        },
        {
            id: 6, categoryId: 202, category: { id: 202, name: "Accessoires natation", active: 1, order: 1 }, subCategoryId: 303, subCategory: { id: 303, name: "Lunettes", active: 1, order: 1 }
            , brandId: 403, brand: { id: 403, name: "SwimVision" }, isPackage: false, price: 34.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 25, weight: 3, createdAt: new Date("2024-01-06").toISOString(), updatedAt: new Date("2024-01-06").toISOString()
            , descriptions: [{ lang: "fr", title: "Lunettes compétition", description: "Lunettes de natation pour compétition" }]
            , images: [{ productId: 6, url: "https://example.com/goggles2.jpg", attributeValueId: 6 }]
        },
        {
            id: 7, categoryId: 203, category: { id: 203, name: "Équipement entraînement", active: 1, order: 1 }, subCategoryId: 304, subCategory: { id: 304, name: "Palmes", active: 1, order: 1 }
            , brandId: 404, brand: { id: 404, name: "AquaGear" }, isPackage: false, price: 49.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, weight: 3, createdAt: new Date("2024-01-07").toISOString(), updatedAt: new Date("2024-01-07").toISOString()
            , descriptions: [{ lang: "fr", title: "Palmes d'entraînement", description: "Palmes courtes pour entraînement intensif" }]
            , images: [{ productId: 7, url: "https://example.com/fins1.jpg", attributeValueId: 7 }]
        },
        {
            id: 8, categoryId: 203, category: { id: 203, name: "Équipement entraînement", active: 1, order: 1 }, subCategoryId: 304, subCategory: { id: 304, name: "Palmes", active: 1, order: 1 }
            , brandId: 404, brand: { id: 404, name: "AquaGear" }, isPackage: false, price: 59.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 15, weight: 3, createdAt: new Date("2024-01-08").toISOString(), updatedAt: new Date("2024-01-08").toISOString()
            , descriptions: [{ lang: "fr", title: "Palmes longues pro", description: "Palmes longues pour nageurs confirmés" }]
            , images: [{ productId: 8, url: "https://example.com/fins2.jpg", attributeValueId: 8 }]
        },
        {
            id: 9, categoryId: 203, category: { id: 203, name: "Équipement entraînement", active: 1, order: 1 }, subCategoryId: 305, subCategory: { id: 305, name: "Planches", active: 1, order: 1 }
            , brandId: 404, brand: { id: 404, name: "AquaGear" }, isPackage: false, price: 24.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 25, weight: 3, createdAt: new Date("2024-01-09").toISOString(), updatedAt: new Date("2024-01-09").toISOString()
            , descriptions: [{ lang: "fr", title: "Planche de natation", description: "Planche d'entraînement en mousse haute densité" }]
            , images: [{ productId: 9, url: "https://example.com/board1.jpg", attributeValueId: 9 }]
        },
        {
            id: 10, categoryId: 203, category: { id: 203, name: "Équipement entraînement", active: 1, order: 1 }, subCategoryId: 305, subCategory: { id: 305, name: "Planches", active: 1, order: 1 }
            , brandId: 404, brand: { id: 404, name: "AquaGear" }, isPackage: false, price: 29.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0
            , status: ProductStatus.PUBLISHED, customization: false, minStock: 20, weight: 3, createdAt: new Date("2024-01-10").toISOString(), updatedAt: new Date("2024-01-10").toISOString()
            , descriptions: [{ lang: "fr", title: "Planche pro", description: "Planche professionnelle hydrodynamique" }]
            , images: [{ productId: 10, url: "https://example.com/board2.jpg", attributeValueId: 10 }]
        }
    ];

    SharedMemory.models = [
        { id: 1, productId: 1, weight: 3, priceWithoutVat: 100, priceWithVat: 120, published: true, minStock: 15, purchasePrice: 100, barcode: "1234567890", supplierReference: "1234567890"
            , manufacturerReference: "1234567890", attributValues: [] },
    ]

    SharedMemory.productAdmin = [
        { productId: 1, state: ProductState.NORMAL, supplierId: 1, manufacturerReference: "1234567890", comment: "Comment 1", buyPriceWithoutVat: 100, supplierReference: "1234567890", barCode: "1234567890" },
    ]

    SharedMemory.stores = [
        { id: 1, name: "Store 1", active: 1, order: 1 },
        { id: 2, name: "Store 2", active: 1, order: 1 },
        { id: 3, name: "Store 3", active: 1, order: 1 },
    ]

    SharedMemory.productStores = [
        { productId: 1, storeId: 1 },
    ]

    SharedMemory.productOnlineShopes = [
        { productId: 1, onlineShop: OnlineShop.NATAQUASHOP },
    ]

    SharedMemory.categories = [
        { id: 1, name: "Category 1", active: 1, order: 1 },
        { id: 2, name: "Category 2", active: 1, order: 1 },
        { id: 3, name: "Category 3", active: 1, order: 1 },
    ]

    SharedMemory.subCategories = [
        { id: 1, name: "SubCategory 1", active: 1, order: 1 },
        { id: 2, name: "SubCategory 2", active: 1, order: 1 },
        { id: 3, name: "SubCategory 3", active: 1, order: 1 },
    ]

    SharedMemory.brands = [
        { id: 1, name: "Brand 1" },
        { id: 2, name: "Brand 2" },
        { id: 3, name: "Brand 3" },
    ]

    SharedMemory.attributs = [
        { id: 1, nom: "Couleur", legende: "Couleur du produit" },
        { id: 2, nom: "Taille", legende: "Taille du produit" },
        { id: 3, nom: "Matière", legende: "Matière du produit" },
    ]

    SharedMemory.attribut_valeurs = [
        { id: 1, id_attribut: 1, nom: "Rouge" },
        { id: 2, id_attribut: 1, nom: "Bleu" },
        { id: 3, id_attribut: 1, nom: "Vert" },
        { id: 4, id_attribut: 2, nom: "S" },
        { id: 5, id_attribut: 2, nom: "M" },
        { id: 6, id_attribut: 2, nom: "L" },
        { id: 7, id_attribut: 2, nom: "XL" },
        { id: 8, id_attribut: 3, nom: "Coton" },
        { id: 9, id_attribut: 3, nom: "Polyester" },
        { id: 10, id_attribut: 3, nom: "Laine" },
    ] 
    
    SharedMemory.suppliers = [
        { id: 1, code: "SUP1", name: "Supplier 1", address: "123 Main St", zipCode: "12345", city: "Anytown", country: "USA", phone: "123-456-7890", email: "supplier1@example.com", siret: "12345678901234" },
        { id: 2, code: "SUP2", name: "Supplier 2", address: "456 Elm St", zipCode: "67890", city: "Othertown", country: "USA", phone: "098-765-4321", email: "supplier2@example.com", siret: "12345678901234" },
        { id: 3, code: "SUP3", name: "Supplier 3", address: "789 Oak St", zipCode: "13579", city: "Somecity", country: "USA", phone: "111-222-3333", email: "supplier3@example.com", siret: "12345678901234" },
    ]

    SharedMemory.productCustomizations = [
        { id: 1, productId: 1, description: "Customization 1", price: 100 },
    ]
}

export const teardown = () => {
    SharedMemory.clear();
}