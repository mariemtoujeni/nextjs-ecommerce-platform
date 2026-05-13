import { SharedMemory } from "@repo/core/adapters/mock";
import { ProductStatus } from "../../../src/models";

export const setup = async () => {
    SharedMemory.products = [
        {
            id: 1,            
            categoryId: 1,
            category: {
                id: 1,
                name: "Category 1",
                active: 1,
                order: 1,
            },
            subCategoryId: 1,
            subCategory: {
                id: 1,
                name: "SubCategory 1",
                active: 1,
                order: 1,
            },
            brandId: 1,
            brand: {
                id: 1,
                name: "Brand 1",
            },
            isPackage: false,
            price: 100,
            vatRate: 100,
            isGiftCard: false,
            giftCardDuration: 100,
            status: ProductStatus.PUBLISHED,
            customization: false,
            minStock: 100,
            weight: 100,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            descriptions: [{
                productId: 1,
                title: "Product 1",
                lang: "fr",
                description: "Product 1 description",
            }],
            images: [{
                productId: 1,
                url: "https://example.com/image.jpg",
                attributeValueId: 1,
            }]
        }
    ];

    SharedMemory.models = [
        {
            id: 1,
            productId: 1,
            weight: 100,
            priceWithoutVat: 100,
            priceWithVat: 100,
            published: true,
            minStock: 100,
            purchasePrice: 100,
            barcode: "1234567890",
            supplierReference: "1234567890",
            manufacturerReference: "1234567890",
            attributValues: [],
        },
    ];

    SharedMemory.model_attribut_valeurs = [
        {
            idModel: 1,
            idAttributValue: 1,
            attributValue: {
                id: 1,
                id_attribut: 1,
                nom: "Attribut Value 1",
            },
        },
    ];

    SharedMemory.attribut_valeurs = [
        {
            id: 1,
            id_attribut: 1,
            nom: "Attribut Value 1",
        },
    ];
}

export const teardown = async () => {
    SharedMemory.clear();
}