import { ClientType, OnlineShop, OrderDeliveryMode, ProductStatus, ReductionType, ReductionValueType } from "@repo/core/models";
import { SharedMemory } from "@repo/core/adapters/mock";

export const setup = () => {
    SharedMemory.users = [
        {
            id: "user1",
            email: "jean.dupont@email.com",
            password: "test",
            last_name: "Dupont",
            first_name: "Jean",
            is_anonymous: false,
            user_role: "member"
        },
        {
            id: "user2",
            email: "marie.martin@email.com",
            password: "test",
            last_name: "Martin",
            first_name: "Marie",
            is_anonymous: false,
            user_role: "member"
        },
        {
            id: "user3",
            email: "pierre.dubois@email.com",
            password: "test",
            last_name: "Dubois",
            first_name: "Pierre",
            is_anonymous: false,
            user_role: "member"
        },
        {
            id: "user4",
            email: "user4@email.com",
            password: "test",
            last_name: "user",
            first_name: "user",
            is_anonymous: false,
            user_role: "member"
        },
        {
            id: "user5",
            email: "user5@email.com",
            password: "test",
            last_name: "user5",
            first_name: "user5",
            is_anonymous: false,
            user_role: "member"
        }
    ];
    SharedMemory.clients = [
        {
            userId: "user2",
            email: "",
            lastName: "",
            firstName: "",
            phone: "",
            mobilePhone: "",
            workPhone: "",
            clubMemberId: 0,
            clubId: 0,
            clientNumber: 785,
            type: ClientType.CLIENT,
            lang: "",
            newsLetter: false,
            siteOffer: false,
            partnerOffer: false,
            credit: 0,
            fidelityPoints: 0,
            birthDate: new Date(),
            clientAddress: [
                {
                    id: 1,
                    numero_client: 785,
                    designation: "",
                    civilite: "Mme",
                    nom: "Martin",
                    prenom: "Marie",
                    adresse: "123 Rue de la République",
                    adresse2: "Appartement 4B",
                    adresse3: "",
                    code_postal: "75001",
                    ville: "Paris",
                    pays: "FR",
                    interphone: "04",
                    code_porte: "12A",
                    instructions: "Sonner deux fois",
                    default: true,
                    created_at: new Date("2025-01-15T10:00:00Z"),
                    updated_at: new Date("2025-05-10T12:30:00Z"),
                    societe: "Martin SARL"
                },
                {
                    id: 0,
                    numero_client: 785,
                    designation: "",
                    civilite: "",
                    nom: "",
                    prenom: "",
                    adresse: "",
                    adresse2: "",
                    adresse3: "",
                    code_postal: "",
                    ville: "",
                    pays: "",
                    interphone: "",
                    code_porte: "",
                    instructions: "",
                    default: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                    societe: ""
                },                
            ],
            order: [],
            quotation: [],
            createdAt: ""
        },
        {
            userId: "user3",
            email: "",
            lastName: "",
            firstName: "",
            phone: "",
            mobilePhone: "",
            workPhone: "",
            clubMemberId: 0,
            clubId: 0,
            clientNumber: 787,
            type: ClientType.CLIENT,
            lang: "",
            newsLetter: false,
            siteOffer: false,
            partnerOffer: false,
            credit: 0,
            fidelityPoints: 0,
            birthDate: new Date(),
            clientAddress: [
                {
                    id: 1,
                    numero_client: 787,
                    designation: "",
                    civilite: "Mr",
                    nom: "pierre",
                    prenom: "dubois",
                    adresse: "123 Rue de la République",
                    adresse2: "Appartement 4B",
                    adresse3: "",
                    code_postal: "75001",
                    ville: "Paris",
                    pays: "FR",
                    interphone: "04",
                    code_porte: "12A",
                    instructions: "Sonner deux fois",
                    default: false,
                    created_at: new Date("2025-01-15T10:00:00Z"),
                    updated_at: new Date("2025-05-10T12:30:00Z"),
                    societe: "Martin SARL"
                },              
            ],
            order: [],
            quotation: [],
            createdAt: ""
        },
        {
            userId: "user5",
            email: "",
            lastName: "",
            firstName: "",
            phone: "",
            mobilePhone: "",
            workPhone: "",
            clubMemberId: 0,
            clubId: 0,
            clientNumber: 700,
            type: ClientType.CLIENT,
            lang: "",
            newsLetter: false,
            siteOffer: false,
            partnerOffer: false,
            credit: 0,
            fidelityPoints: 0,
            birthDate: new Date(),
            clientAddress: [
                {
                    id: 1,
                    numero_client: 700,
                    designation: "",
                    civilite: "Mr",
                    nom: "user5",
                    prenom: "user5",
                    adresse: "123 Rue de la République",
                    adresse2: "Appartement 4B",
                    adresse3: "",
                    code_postal: "75001",
                    ville: "Paris",
                    pays: "FR",
                    interphone: "04",
                    code_porte: "12A",
                    instructions: "Sonner deux fois",
                    default: false,
                    created_at: new Date("2025-01-15T10:00:00Z"),
                    updated_at: new Date("2025-05-10T12:30:00Z"),
                    societe: "Martin SARL"
                },              
            ],
            order: [],
            quotation: [],
            createdAt: ""
        },
        {
            userId: "user1",
            email: "",
            lastName: "",
            firstName: "",
            phone: "",
            mobilePhone: "",
            workPhone: "",
            clubMemberId: 0,
            clubId: 0,
            clientNumber: 701,
            type: ClientType.CLIENT,
            lang: "",
            newsLetter: false,
            siteOffer: false,
            partnerOffer: false,
            credit: 0,
            fidelityPoints: 0,
            birthDate: new Date(),
            clientAddress: [
                {
                    id: 1,
                    numero_client: 701,
                    designation: "",
                    civilite: "Mr",
                    nom: "user1",
                    prenom: "user1",
                    adresse: "123 Rue de la République",
                    adresse2: "Appartement 4B",
                    adresse3: "",
                    code_postal: "75001",
                    ville: "Paris",
                    pays: "FR",
                    interphone: "04",
                    code_porte: "12A",
                    instructions: "Sonner deux fois",
                    default: true,
                    created_at: new Date("2025-01-15T10:00:00Z"),
                    updated_at: new Date("2025-05-10T12:30:00Z"),
                    societe: "Martin SARL"
                },              
            ],
            order: [],
            quotation: [],
            createdAt: ""
        },
        {
            userId: "user4",
            email: "",
            lastName: "",
            firstName: "",
            phone: "",
            mobilePhone: "",
            workPhone: "",
            clubMemberId: 0,
            clubId: 0,
            clientNumber: 789,
            type: ClientType.CLIENT,
            lang: "",
            newsLetter: false,
            siteOffer: false,
            partnerOffer: false,
            credit: 0,
            fidelityPoints: 0,
            birthDate: new Date(),
            clientAddress: [
                {
                    id: 1,
                    numero_client: 789,
                    designation: "",
                    civilite: "Mr",
                    nom: "user4",
                    prenom: "user4",
                    adresse: "123 Rue de la République",
                    adresse2: "Appartement 4B",
                    adresse3: "",
                    code_postal: "75001",
                    ville: "Paris",
                    pays: "FR",
                    interphone: "04",
                    code_porte: "12A",
                    instructions: "Sonner deux fois",
                    default: true,
                    created_at: new Date("2025-01-15T10:00:00Z"),
                    updated_at: new Date("2025-05-10T12:30:00Z"),
                    societe: "Martin SARL"
                },              
            ],
            order: [],
            quotation: [],
            createdAt: ""
        }
    ]
    SharedMemory.cart = [
        {
            userId: "user1",
            modelId: 1,
            quantity: 2,
            shipping: "24h",
            customization: false,
            text: "",
            price: 89.99,
            discountType: ReductionType.CLUB,
            discountValueType: ReductionValueType.PERCENTAGE,
            discountValue: 10,
            discountInfo: "Member discount",
            createdAt: new Date("2024-05-01"),
            updatedAt: new Date("2024-05-01"),
            model: {
                id: 1,
                productId: 101,
                weight: 0.5,
                priceWithoutVat: 81.81,
                priceWithVat: 89.99,
                published: true,
                minStock: 5,
                attributValeurs: [],
                productDetails: {
                    descriptions: [],
                    images: []
                },
                attributs: [],
                attributValues: []
            },
            textPersonalisation: "",
            typePersonalisation: ""
        },
        {
            userId: "user1",
            modelId: 5,
            quantity: 1,
            shipping: "24h",
            customization: false,
            text: "",
            price: 29.99,
            discountType: ReductionType.CODE_PROMO,
            discountValueType: ReductionValueType.MONTANT,
            discountValue: 5,
            discountInfo: "SUMMER2024",
            createdAt: new Date("2024-05-02"),
            updatedAt: new Date("2024-05-02"),
            model: {
                id: 5,
                productId: 105,
                weight: 0.3,
                priceWithoutVat: 27.26,
                priceWithVat: 29.99,
                published: true,
                minStock: 10,
                attributValeurs: [],
                productDetails: {
                    descriptions: [],
                    images: []
                },
                attributs: [],
                attributValues: []
            },
            textPersonalisation: "",
            typePersonalisation: ""
        },
        {
            userId: "user2",
            modelId: 3,
            quantity: 1,
            shipping: "2024-06-20",
            customization: true,
            text: "Add initials 'JP' on the top",
            price: 79.99,
            discountType: ReductionType.AVOIR,
            discountValueType: ReductionValueType.MONTANT,
            discountValue: 0,
            discountInfo: "",
            createdAt: new Date("2024-05-03"),
            updatedAt: new Date("2024-05-03"),
            model: {
                id: 3,
                productId: 103,
                weight: 1.2,
                priceWithoutVat: 72.72,
                priceWithVat: 79.99,
                published: true,
                minStock: 3,
                attributValeurs: [],
                productDetails: {
                    descriptions: [],
                    images: []
                },
                attributs: [],
                attributValues: []
            },
            textPersonalisation: "",
            typePersonalisation: ""
        },
        {
            userId: "user4",
            modelId: 3,
            quantity: 2,
            shipping: "2024-06-20",
            customization: true,
            text: "Add initials 'JP' on the top",
            price: 79.99,
            discountType: ReductionType.AVOIR,
            discountValueType: ReductionValueType.MONTANT,
            discountValue: 0,
            discountInfo: "",
            createdAt: new Date("2024-05-03"),
            updatedAt: new Date("2024-05-03"),
            model: {
                id: 3,
                productId: 103,
                weight: 1.2,
                priceWithoutVat: 72.72,
                priceWithVat: 79.99,
                published: true,
                minStock: 3,
                attributValeurs: [],
                productDetails: {
                    descriptions: [],
                    images: []
                },
                attributs: [],
                attributValues: []
            },
            textPersonalisation: "",
            typePersonalisation: ""
        }
    ];

    SharedMemory.modelProduct = [
        {
            id: 1,
            productId: 101,
            weight: 0.5,
            priceWithoutVat: 81.81,
            priceWithVat: 89.99,
            published: true,
            minStock: 5,
            attributValeurs: [],
            productDetails: {
                descriptions: [],
                images: []
            },
            attributs: [],
            attributValues: []
        },
        {
            id: 5,
            productId: 105,
            weight: 0.3,
            priceWithoutVat: 27.26,
            priceWithVat: 29.99,
            published: true,
            minStock: 10,
            attributValeurs: [],
            productDetails: {
                descriptions: [],
                images: []
            },
            attributs: [],
            attributValues: []
        },
        {
            id: 3,
            productId: 103,
            weight: 1.2,
            priceWithoutVat: 72.72,
            priceWithVat: 79.99,
            published: true,
            minStock: 3,
            attributValeurs: [],
            productDetails: {
                descriptions: [],
                images: []
            },
            attributs: [],
            attributValues: []
        }
    ];

    SharedMemory.stocks = [
        {
            idModel: 1,
            disponible: 10,
            indisponible: 0,
            locked: 0,
            updatedAt: ""
        },
        {
            idModel: 5,
            disponible: 15,
            indisponible: 0,
            locked: 0,
            updatedAt: ""
        },
        {
            idModel: 3,
            disponible: 5,
            indisponible: 0,
            locked: 0,
            updatedAt: ""
        }
    ];
    SharedMemory.products = [
    {
        id: 101,
        categoryId: 1, category: { id: 1, name: "Swimwear", active: 0, order: 0 },
        subCategoryId: 11, subCategory: { id: 11, name: "Men's Swimwear", active: 0, order: 0 },
        brandId: 1001, brand: { id: 1001, name: "Speedo" }, isPackage: false, price: 89.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0, status: ProductStatus.PUBLISHED, customization: false, minStock: 5, createdAt: new Date("2024-04-01").toISOString(), updatedAt: new Date("2024-04-10").toISOString(),
        descriptions: [ { productId: 101, title: "Men's Racing Jammer", lang: "en", description: "Performance swimwear engineered for speed and comfort." } ],
        images: [ { productId: 101, url: "https://cdn.shop.com/images/101.jpg", attributeValueId: 1 } ],
        stores: [], productAttributes: [], modeles: [], modelAttributs: [], collections: [], weight: 0.5, onlineShops: [OnlineShop.NATAQUASHOP]
    },
    {
        id: 105,
        categoryId: 2, category: { id: 2, name: "Accessories", active: 0, order: 0 },
        subCategoryId: 21, subCategory: { id: 21, name: "Goggles", active: 0, order: 0 },
        brandId: 1002, brand: { id: 1002, name: "Arena" }, isPackage: false, price: 29.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0, status: ProductStatus.PUBLISHED, customization: false, minStock: 10, createdAt: new Date("2024-03-15").toISOString(), updatedAt: new Date("2024-03-20").toISOString(),
        descriptions: [ { productId: 105, title: "Swim Goggles", lang: "en", description: "Anti-fog competition goggles for optimal visibility." } ],
        images: [ { productId: 105, url: "https://cdn.shop.com/images/105.jpg", attributeValueId: 2 } ],
        stores: [], productAttributes: [], modeles: [], modelAttributs: [], collections: [], weight: 0.3, onlineShops: [OnlineShop.CRAZYSWIM]
    },
    {
        id: 103,
        categoryId: 3, category: { id: 3, name: "Training Gear", active: 0, order: 0 },
        subCategoryId: 31, subCategory: { id: 31, name: "Resistance Equipment", active: 0, order: 0 },
        brandId: 1003, brand: { id: 1003, name: "TYR" }, isPackage: false, price: 79.99, vatRate: 20, isGiftCard: false, giftCardDuration: 0, status: ProductStatus.PUBLISHED, customization: true, minStock: 3, createdAt: new Date("2024-02-01").toISOString(), updatedAt: new Date("2024-02-10").toISOString(),
        descriptions: [ { productId: 103, title: "Resistance Trainer", lang: "en", description: "Perfect for dryland swim training with customizable resistance." } ],
        images: [ { productId: 103, url: "https://cdn.shop.com/images/103.jpg", attributeValueId: 3 } ],
        stores: [], productAttributes: [], modeles: [], modelAttributs: [], collections: [], weight: 1.2, onlineShops: [OnlineShop.SWIMWEAR_DESTOCK]
    }
    ];

    SharedMemory.deliveryCarts = [
        {
            userId: "user1",
            deliveryMode: OrderDeliveryMode.AU_MAGASIN,
            billingAddressId: 0,
            relaisId: "",
            weight: 1.3,
            prix: 11,
            company: "",
            lastName: "",
            firstName: "",
            adress: "",
            adress2: "",
            adress3: "",
            postCode: "",
            city: "",
            country: "",
            valid: false,
            billingAddress: [],
            clientAddress: []
        },
        {
            userId: "user4",
            deliveryMode: OrderDeliveryMode.MONDIAL_RELAY,
            billingAddressId: 0,
            relaisId: "",
            weight: 1.2,
            prix: 11,
            company: "",
            lastName: "",
            firstName: "",
            adress: "",
            adress2: "",
            adress3: "",
            postCode: "",
            city: "",
            country: "FR",
            valid: false,
            billingAddress: [],
            clientAddress: []
        },
        {
            userId: "user5",
            deliveryMode: OrderDeliveryMode.AU_MAGASIN,
            billingAddressId: 0,
            relaisId: "",
            weight: 1.2,
            prix: 11,
            company: "",
            lastName: "",
            firstName: "",
            adress: "",
            adress2: "",
            adress3: "",
            postCode: "",
            city: "",
            country: "FR",
            valid: false,
            billingAddress: [],
            clientAddress: []
        }
    ]

    SharedMemory.shipmentConfs = [
        {
            mode_livraison: "MONDIAL_RELAY",
            zone: "Zone A",
            poids_min: 0,
            poids_max: 5000,
            prix: 11,
            livraison_zones_pays: []
        }
    ]

    SharedMemory.shipmentsZonesCountries = [
        {
            mode_livraison: "MONDIAL_RELAY",
            code: "FR",
            zone: "Zone A"
        }
    ]
    SharedMemory.discountCarts = [
    {
        userId: "user1",
        discountTypeValue: ReductionValueType.PERCENTAGE,
        value: 10,
        discountType: ReductionType.CLUB,
        id: 1,
        info: ""
    },
    {
        userId: "user1",
        discountTypeValue: ReductionValueType.MONTANT, 
        value: 5,
        discountType: ReductionType.CODE_PROMO,
        id: 5,
        info: ""
    }
    ]
    SharedMemory.addresses = [
                {
                    id: 1,
                    numero_client: 785,
                    designation: "",
                    civilite: "Mme",
                    nom: "Martin",
                    prenom: "Marie",
                    adresse: "123 Rue de la République",
                    adresse2: "Appartement 4B",
                    adresse3: "",
                    code_postal: "75001",
                    ville: "Paris",
                    pays: "FR",
                    interphone: "04",
                    code_porte: "12A",
                    instructions: "Sonner deux fois",
                    default: true,
                    created_at: new Date("2025-01-15T10:00:00Z"),
                    updated_at: new Date("2025-05-10T12:30:00Z"),
                    societe: "Martin SARL"
                },
                {
                    id: 0,
                    numero_client: 785,
                    designation: "",
                    civilite: "",
                    nom: "",
                    prenom: "",
                    adresse: "",
                    adresse2: "",
                    adresse3: "",
                    code_postal: "",
                    ville: "",
                    pays: "",
                    interphone: "",
                    code_porte: "",
                    instructions: "",
                    default: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                    societe: ""
                },                
            ]
};

export const teardown = () => {
    SharedMemory.clear();
};