import { SharedMemory } from "@repo/core/adapters/mock";
import { CheckoutStatus, ClientType, DiscountType, PaymentMethod, PaymentMode, PurchaseOrderStatus, ShopStatus, UserRoles } from "../../../src/models";

export const setup = () => {
    SharedMemory.users = [
        { id: "1", email: "admin@admin.com", user_role: UserRoles.SUPER_ADMIN, first_name: "Admin", last_name: "Admin", password: "admin", is_anonymous: false },
    ]

    SharedMemory.clients = [
        {
            clientNumber: 1,
            lastName: "User 1",
            firstName: "User 1",
            email: "user1@example.com",
            phone: "1234567890",
            mobilePhone: "1234567890",
            workPhone: "1234567890",
            clubMemberId: 1,
            clubId: 1,
            club: {
                id: 1,
                name: "Club 1",
                president: "",
                email: "",
                accountantAccount: "",
                paymentMode: 0,
                paymentDelay: 0,
                referent: "",
                phone: "",
                partner: false,
                code: "",
                valid: true,
                siren: "",
                tvaNumber: ""
            },
            type: ClientType.CLIENT,
            lang: "fr",
            birthDate: new Date(),
            newsLetter: true,
            siteOffer: true,
            partnerOffer: true,
            fidelityPoints: 100,
            credit: 100,
            clientAddress: [{
                id: 0,
                numero_client: 0,
                designation: "",
                civilite: "",
                nom: "",
                prenom: "",
                adresse: "1234567890",
                adresse2: "1234567890",
                adresse3: "1234567890",
                code_postal: "75001",
                ville: "Paris",
                pays: "France",
                interphone: "",
                code_porte: "",
                instructions: "",
                default: false,
                created_at: new Date(),
                updated_at: new Date(),
                societe: ""
            }],
            order: [],
            quotation: [],
            createdAt: new Date(),
            userId: "1"
        },
        { 
            clientNumber: 2, 
            lastName: "User 2", 
            firstName: "User 2", 
            email: "user2@example.com",
            phone: "1234567890",
            mobilePhone: "1234567890",
            workPhone: "1234567890",
            clubMemberId: 2,
            clubId: 2,
            club: {
                id: 2,
                name: "Club 2",
                president: "",
                email: "",
                accountantAccount: "",
                paymentMode: 0,
                paymentDelay: 0,
                referent: "",
                phone: "",
                partner: false,
                code: "",
                valid: true,
                siren: "",
                tvaNumber: ""
            },
            type: ClientType.CLIENT,
            lang: "fr",
            birthDate: new Date(),
            newsLetter: true,
            siteOffer: true,
            partnerOffer: true,
            fidelityPoints: 100,
            credit: 100,
            clientAddress: [{
                id: 0,
                numero_client: 0,
                designation: "",
                civilite: "",
                nom: "",
                prenom: "",
                adresse: "1234567890",
                adresse2: "1234567890",
                adresse3: "1234567890",
                code_postal: "75001",
                ville: "Paris",
                pays: "France",
                interphone: "",
                code_porte: "",
                instructions: "",
                default: false,
                created_at: new Date(),
                updated_at: new Date(),
                societe: ""
            }],
            order: [],
            quotation: [],
            createdAt: new Date(),
            userId: "2"
        },
        {
            clientNumber: 3,
            lastName: "User 3",
            firstName: "User 3",
            email: "user3@example.com",
            phone: "1234567890",
            mobilePhone: "1234567890",
            workPhone: "1234567890",
            clubMemberId: 3,
            clubId: 3,
            club: {
                id: 3,
                name: "Club 3",
                president: "",
                email: "",
                accountantAccount: "",
                paymentMode: 0,
                paymentDelay: 0,
                referent: "",
                phone: "",
                partner: false,
                code: "",
                valid: true,
                siren: "",
                tvaNumber: ""
            },
            type: ClientType.CLIENT,
            lang: "fr",
            birthDate: new Date(),
            newsLetter: true,
            siteOffer: true,
            partnerOffer: true,
            fidelityPoints: 100,
            credit: 100,
            clientAddress: [{
                id: 0,
                numero_client: 0,
                designation: "",
                civilite: "",
                nom: "",
                prenom: "",
                adresse: "1234567890",
                adresse2: "1234567890",
                adresse3: "1234567890",
                code_postal: "75001",
                ville: "Paris",
                pays: "France",
                interphone: "",
                code_porte: "",
                instructions: "",
                default: false,
                created_at: new Date(),
                updated_at: new Date(),
                societe: ""
            }],
            order: [],
            quotation: [],
            createdAt: new Date(),
            userId: "3"
        },
        {
            clientNumber: 4,
            lastName: "User 4",
            firstName: "User 4",
            email: "user4@example.com",
            phone: "1234567890",
            mobilePhone: "1234567890",
            workPhone: "1234567890",
            clubMemberId: 4,
            clubId: 4,
            club: {
                id: 4,
                name: "Club 4",
                president: "",
                email: "",
                accountantAccount: "",
                paymentMode: 0,
                paymentDelay: 0,
                referent: "",
                phone: "",
                partner: false,
                code: "",
                valid: true,
                siren: "",
                tvaNumber: ""
            },
            type: ClientType.CLIENT,
            lang: "fr",
            birthDate: new Date(),
            newsLetter: true,
            siteOffer: true,
            partnerOffer: true, 
            fidelityPoints: 100,
            credit: 100,
            clientAddress: [{
                id: 0,
                numero_client: 0,
                designation: "",
                civilite: "",
                nom: "",
                prenom: "",
                adresse: "1234567890",
                adresse2: "1234567890",
                adresse3: "1234567890",
                code_postal: "75001",
                ville: "Paris",
                pays: "France",
                interphone: "",
                code_porte: "",
                instructions: "",
                default: false,
                created_at: new Date(),
                updated_at: new Date(),
                societe: ""
            }],
            order: [],
            quotation: [],
            createdAt: new Date(),
            userId: "4"
        },
        {
            clientNumber: 5,
            lastName: "User 5",
            firstName: "User 5",
            email: "user5@example.com",
            phone: "1234567890",
            mobilePhone: "1234567890",
            workPhone: "1234567890",
            clubMemberId: 5,
            clubId: 5,
            club: {
                id: 5,
                name: "Club 5",
                president: "",
                email: "",
                accountantAccount: "",
                paymentMode: 0,
                paymentDelay: 0,
                referent: "",
                phone: "",
                partner: false,
                code: "",
                valid: true,
                siren: "",
                tvaNumber: ""
            },
            type: ClientType.CLIENT,
            lang: "fr",
            birthDate: new Date(),
            newsLetter: true,
            siteOffer: true,
            partnerOffer: true,
            fidelityPoints: 100,
            credit: 100,
            clientAddress: [{
                id: 0,
                numero_client: 0,
                designation: "",
                civilite: "",
                nom: "",
                prenom: "",
                adresse: "1234567890",
                adresse2: "1234567890",
                adresse3: "1234567890",
                code_postal: "75001",
                ville: "Paris",
                pays: "France",
                interphone: "",
                code_porte: "",
                instructions: "",
                default: false,
                created_at: new Date(),
                updated_at: new Date(),
                societe: ""
            }],
            order: [],
            quotation: [],
            createdAt: new Date(),
            userId: "5"
        },
        {
            clientNumber: 6,
            lastName: "User 6",
            firstName: "User 6",
            email: "user6@example.com",
            phone: "1234567890",
            mobilePhone: "1234567890",
            workPhone: "1234567890",
            clubMemberId: 6,
            clubId: 6,
            club: {
                id: 6,
                name: "Club 6",
                president: "",
                email: "",
                accountantAccount: "",
                paymentMode: 0,
                paymentDelay: 0,
                referent: "",
                phone: "",
                partner: false,
                code: "",
                valid: true,
                siren: "",
                tvaNumber: ""
            },
            type: ClientType.CLIENT,
            lang: "fr",
            birthDate: new Date(),
            newsLetter: true,
            siteOffer: true,
            partnerOffer: true,
            fidelityPoints: 100,
            credit: 100,
            clientAddress: [{
                id: 0,
                numero_client: 0,
                designation: "",
                civilite: "",
                nom: "",
                prenom: "",
                adresse: "1234567890",
                adresse2: "1234567890",
                adresse3: "1234567890",
                code_postal: "75001",
                ville: "Paris",
                pays: "France",
                interphone: "",
                code_porte: "",
                instructions: "",
                default: false,
                created_at: new Date(),
                updated_at: new Date(),
                societe: ""
            }],
            order: [],
            quotation: [],
            createdAt: new Date(),
            userId: "6"
        }
    ];

    SharedMemory.shops = [
        { id: 1, name: "Shop 1", expirationDate: new Date(), isActive: true, createdAt: new Date(), status: ShopStatus.OPEN, department: "1" },
        { id: 2, name: "Shop 2", expirationDate: new Date(), isActive: true, createdAt: new Date(), status: ShopStatus.OPEN, department: "2" },
        { id: 3, name: "Shop 3", expirationDate: new Date(), isActive: true, createdAt: new Date(), status: ShopStatus.OPEN, department: "3" },
        { id: 4, name: "Shop 4", expirationDate: new Date(), isActive: true, createdAt: new Date(), status: ShopStatus.OPEN, department: "4" },
        { id: 5, name: "Shop 5", expirationDate: new Date(), isActive: true, createdAt: new Date(), status: ShopStatus.OPEN, department: "5" },
        { id: 6, name: "Shop 6", expirationDate: new Date(), isActive: true, createdAt: new Date(), status: ShopStatus.OPEN, department: "6" },
    ];

    SharedMemory.shopLines = [
        { 
            idModel: 1, 
            idShop: 1, 
            initialQuantity: 10, 
            soldQuantity: 1, 
            finalQuantity: 9, 
            totalPriceTTC: 120
        },
        { 
            idModel: 2, 
            idShop: 2, 
            initialQuantity: 10, 
            soldQuantity: 1, 
            finalQuantity: 9, 
            totalPriceTTC: 120
        },
        { 
            idModel: 3, 
            idShop: 3, 
            initialQuantity: 10, 
            soldQuantity: 1, 
            finalQuantity: 9, 
            totalPriceTTC: 120
        },
        { 
            idModel: 4, 
            idShop: 4, 
            initialQuantity: 10, 
            soldQuantity: 1, 
            finalQuantity: 9, 
            totalPriceTTC: 120
        },
    ];

    SharedMemory.checkouts = [
        {
            id: 1, idClient: 1, idShop: 1, paymentMethod: PaymentMethod.CASH, discountType: DiscountType.PERCENTAGE, discountAmount: '10', totalHT: '90', totalTTC: '108', cbAmount: '0', cashAmount: '108', checkAmount: '0', NoVAT: false, createdAt: new Date(),
            status: CheckoutStatus.OPEN
        },
        { id: 2, idClient: 2, idShop: 2, paymentMethod: PaymentMethod.CREDIT_CARD, discountType: DiscountType.FIXED, discountAmount: '10', totalHT: '90', totalTTC: '108', cbAmount: '108', cashAmount: '0', checkAmount: '0', NoVAT: false, createdAt: new Date(),
            status: CheckoutStatus.OPEN
        },
        { id: 3, idClient: 3, idShop: 3, paymentMethod: PaymentMethod.DEBIT_CARD, discountType: DiscountType.PERCENTAGE, discountAmount: '10', totalHT: '90', totalTTC: '108', cbAmount: '108', cashAmount: '0', checkAmount: '0', NoVAT: false, createdAt: new Date(),
            status: CheckoutStatus.OPEN
        },
        { id: 4, idClient: 4, idShop: 4, paymentMethod: PaymentMethod.TRANSFER, discountType: DiscountType.FIXED, discountAmount: '10', totalHT: '90', totalTTC: '108', cbAmount: '0', cashAmount: '0', checkAmount: '0', NoVAT: false, createdAt: new Date(),
            status: CheckoutStatus.OPEN
        },
        { id: 5, idClient: 5, idShop: 5, paymentMethod: PaymentMethod.CHECK, discountType: DiscountType.PERCENTAGE, discountAmount: '10', totalHT: '90', totalTTC: '108', cbAmount: '0', cashAmount: '0', checkAmount: '108', NoVAT: false, createdAt: new Date(),
            status: CheckoutStatus.OPEN
        },
        { id: 6, idClient: 6, idShop: 6, paymentMethod: PaymentMethod.OTHER, discountType: DiscountType.FIXED, discountAmount: '10', totalHT: '90', totalTTC: '108', cbAmount: '0', cashAmount: '0', checkAmount: '108', NoVAT: false, createdAt: new Date(),
            status: CheckoutStatus.OPEN
        },
    ];

    SharedMemory.checkoutLines = [
        { 
            id: 1, 
            idCheckout: 1, 
            idModel: 1, 
            name: "Model 1", 
            codeBar: "1234567890", 
            price: 100, 
            quantity: 1, 
            discount: '10', 
            discountType: DiscountType.PERCENTAGE, 
            VAT: 20, 
            comment: "Comment 1" ,
            modelProduct: {
                name: "Model 1",
                attributs: ["Attribut 1", "Attribut 2"],
                price: 100,
                image: "https://via.placeholder.com/150"
            }
        },
        { id: 2, idCheckout: 2, idModel: 2, name: "Model 2", codeBar: "1234567890", price: 100, quantity: 1, discount: '10', discountType: DiscountType.FIXED, VAT: 20, comment: "Comment 2", modelProduct: {
            name: "Model 2",
            attributs: ["Attribut 1", "Attribut 2"],
            price: 100,
            image: "https://via.placeholder.com/150"
        } },
        { id: 3, idCheckout: 3, idModel: 3, name: "Model 3", codeBar: "1234567890", price: 100, quantity: 1, discount: '10', discountType: DiscountType.PERCENTAGE, VAT: 20, comment: "Comment 3", modelProduct: {
            name: "Model 3",
            attributs: ["Attribut 3", "Attribut 4"],
            price: 100,
            image: "https://via.placeholder.com/151"
        } },
        { id: 4, idCheckout: 4, idModel: 4, name: "Model 4", codeBar: "1234567890", price: 100, quantity: 1, discount: '10', discountType: DiscountType.FIXED, VAT: 20, comment: "Comment 4", modelProduct: {
            name: "Model 4",
            attributs: ["Attribut 5", "Attribut 6"],
            price: 100,
            image: "https://via.placeholder.com/152"
        } },
        { id: 5, idCheckout: 5, idModel: 5, name: "Model 5", codeBar: "1234567890", price: 100, quantity: 1, discount: '10', discountType: DiscountType.PERCENTAGE, VAT: 20, comment: "Comment 5", modelProduct: {
            name: "Model 5",
            attributs: ["Attribut 7", "Attribut 8"],
            price: 100,
            image: "https://via.placeholder.com/153"
        } },
        { id: 6, idCheckout: 6, idModel: 6, name: "Model 6", codeBar: "1234567890", price: 100, quantity: 1, discount: '10', discountType: DiscountType.FIXED, VAT: 20, comment: "Comment 6", modelProduct: {
            name: "Model 6",
            attributs: ["Attribut 9", "Attribut 10"],
            price: 100,
            image: "https://via.placeholder.com/154"
        } },
    ];

    SharedMemory.purchaseOrders = [
        {
            id: 1, 
            supplierId: 1, 
            orderDate: new Date(), 
            paymentMode: PaymentMode.CHEQUE, 
            deliveryDate: new Date(), 
            validationDate: new Date(), 
            remise: 10, 
            totalHT: 100, 
            valid: true, 
            shippingFees: 10, 
            shippingVAT: 20, 
            paymentDelay: 10, 
            deposit: 10, 
            comment: "Comment 1", 
            status: PurchaseOrderStatus.BROUILLON,
            clubId: 0,
            createdAt: new Date()
        },
        { 
            id: 2, 
            supplierId: 1, 
            orderDate: new Date(), 
            paymentMode: PaymentMode.CHEQUE, 
            deliveryDate: new Date(), 
            validationDate: new Date(), 
            remise: 10, 
            totalHT: 100, 
            valid: true, 
            shippingFees: 10, 
            shippingVAT: 20, 
            paymentDelay: 10, 
            deposit: 10, 
            comment: "Comment 2", 
            status: PurchaseOrderStatus.ENVOYEE,
            clubId: 0,
            createdAt: new Date()
        },
        { 
            id: 3, 
            supplierId: 2, 
            orderDate: new Date(), 
            paymentMode: PaymentMode.CHEQUE, 
            deliveryDate: new Date(), 
            validationDate: new Date(), 
            remise: 10, 
            totalHT: 100, 
            valid: true, 
            shippingFees: 10, 
            shippingVAT: 20, 
            paymentDelay: 10, 
            deposit: 10, 
            comment: "Comment 3", 
            status: PurchaseOrderStatus.RECU,
            clubId: 0,
            createdAt: new Date()
        },
        {
            id: 4, 
            supplierId: 3, 
            orderDate: new Date(), 
            paymentMode: PaymentMode.CHEQUE, 
            deliveryDate: new Date(), 
            validationDate: new Date(), 
            remise: 10, 
            totalHT: 100, 
            valid: true, 
            shippingFees: 10, 
            shippingVAT: 20, 
            paymentDelay: 10, 
            deposit: 10, 
            comment: "Comment 4", 
            status: PurchaseOrderStatus.PARTIELLE,
            clubId: 0,
            createdAt: new Date()
        }
    ];

    SharedMemory.purchaseOrderLines = [
        { id: 1, orderSupplierId: 1, modelId: 1, validationDate: new Date(), quantity: 10, receivedQuantity: 0, unitHtPrice: 10, discount: 10, vat: 20, valid: true, comment: "Comment 1", ttcPrice: 100 },
        { id: 2, orderSupplierId: 2, modelId: 2, validationDate: new Date(), quantity: 10, receivedQuantity: 0, unitHtPrice: 10, discount: 10, vat: 20, valid: true, comment: "Comment 2", ttcPrice: 110 },
        { id: 3, orderSupplierId: 3, modelId: 3, validationDate: new Date(), quantity: 10, receivedQuantity: 10, unitHtPrice: 10, discount: 10, vat: 20, valid: true, comment: "Comment 3", ttcPrice: 120 },
        { id: 4, orderSupplierId: 4, modelId: 4, validationDate: new Date(), quantity: 10, receivedQuantity: 8, unitHtPrice: 10, discount: 10, vat: 20, valid: true, comment: "Comment 4", ttcPrice: 130 },
    ];

    SharedMemory.models = [
        { id: 1, productId: 1, weight: 100, priceWithoutVat: 100, priceWithVat: 120, published: true, minStock: 0
            , purchasePrice: 80, barcode: "1111111111", supplierReference: "1111111111", manufacturerReference: "1111111111" 
            , attributValues: []
        }, 
        { id: 2, productId: 2, weight: 100, priceWithoutVat: 100, priceWithVat: 120, published: true, minStock: 0
            , purchasePrice: 80, barcode: "2222222222", supplierReference: "2222222222", manufacturerReference: "2222222222" 
            , attributValues: []
        }
    ]

    SharedMemory.stocks = [
        { idModel: 1, disponible: 40, locked: 0, indisponible: 0, updatedAt: new Date().toISOString() },
        { idModel: 2, disponible: 50, locked: 0, indisponible: 0, updatedAt: new Date().toISOString() },
        { idModel: 3, disponible: 60, locked: 0, indisponible: 0, updatedAt: new Date().toISOString() },
        { idModel: 4, disponible: 70, locked: 0, indisponible: 0, updatedAt: new Date().toISOString() },
    ];
}

export const teardown = () => {
    SharedMemory.clear();
}