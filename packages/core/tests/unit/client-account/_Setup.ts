import { SharedMemory } from "@repo/core/adapters/mock";
import { ClientType, CreditNoteType, DiscountCombination, DiscountState, MinPurchaseCondition, OrderDeliveryMode, OrderStatus, ProductShop, ReductionType, TypeDiscount } from "@repo/core/models";

export const setup = () => {
    SharedMemory.users = [
        {
            id: "1",
            email: "jean.dupont@email.com",
            password: "test",
            last_name: "Dupont",
            first_name: "Jean",
            is_anonymous: false,
            user_role: ""
        },
        {
            id: "9999",
            email: "jean.dupuy@email.com",
            password: "test",
            last_name: "Dupuy",
            first_name: "Jean",
            is_anonymous: false,
            user_role: ""
        },
        {
            id: "3",
            email: "contact@entreprise.fr",
            password: "test",
            last_name: "Dubois",
            first_name: "Pierre",
            is_anonymous: false,
            user_role: ""
        }
    ]

    SharedMemory.clients = [
        {
            userId: "1",
            email: "jean.dupont@email.com",
            firstName: "Jean",
            lastName: "Dupont",
            phone: "0123456789",
            mobilePhone: "0612345678",
            workPhone: "0123456789",
            birthDate: new Date("1985-05-15"),
            type: ClientType.CLIENT,
            lang: "fr",
            clubMemberId: 1,
            clubId: 1,
            clientNumber: 1001,
            newsLetter: true,
            siteOffer: true,
            partnerOffer: true,
            credit: 0,
            fidelityPoints: 150,
            createdAt: new Date("2024-01-01"),
            clientAddress: [],
            order: [],
            quotation: []
        },
        {
            userId: "2",
            email: "marie.martin@email.com",
            firstName: "Marie",
            lastName: "Martin",
            phone: "0123456789",
            mobilePhone: "0612345678",
            workPhone: "0123456789",
            birthDate: new Date("1990-08-22"),
            type: ClientType.CLIENT,
            lang: "fr",
            clubMemberId: 2,
            clubId: 1,
            clientNumber: 1002,
            newsLetter: false,
            siteOffer: true,
            partnerOffer: true,
            credit: 50,
            fidelityPoints: 75,
            createdAt: new Date("2024-01-15"),
            clientAddress: [],
            order: [],
            quotation: []
        },
        {
            userId: "3",
            email: "contact@entreprise.fr",
            firstName: "Pierre",
            lastName: "Dubois",
            phone: "0123456789",
            mobilePhone: "0612345678",
            workPhone: "0123456789",
            birthDate: new Date("1975-03-10"),
            type: ClientType.CLUB,
            lang: "fr",
            clubMemberId: 3,
            clubId: 2,
            clientNumber: 1003,
            newsLetter: true,
            siteOffer: false,
            partnerOffer: false,
            credit: 200,
            fidelityPoints: 300,
            createdAt: new Date("2024-02-01"),
            clientAddress: [],
            order: [],
            quotation: []
        },
        {
            userId: "4",
            email: "info@societe.com",
            firstName: "Sophie",
            lastName: "Leroy",
            phone: "0123456789",
            mobilePhone: "0612345678",
            workPhone: "0123456789",
            birthDate: new Date("1988-11-30"),
            type: ClientType.CLUB,
            lang: "fr",
            clubMemberId: 4,
            clubId: 2,
            clientNumber: 1004,
            newsLetter: true,
            siteOffer: true,
            partnerOffer: true,
            credit: 100,
            fidelityPoints: 250,
            createdAt: new Date("2024-02-15"),
            clientAddress: [],
            order: [],
            quotation: []
        }
    ];

    SharedMemory.orders = [
        {
            id: 1,
            clientId: 1001,
            status: OrderStatus.EXPEDIEE,
            createdAt: new Date("2024-05-01T10:00:00Z"),
            amount: 120.50,
            deliveryFees: 0,
            withoutVAT: false,
            quotation: false,
            deliveryMode: OrderDeliveryMode.COLISSIMO,
            usedCredit: 0,
            totalDiscount: 0,
            authorisation: "",
            paymentMode: "",
            authorisationDate: new Date()
        },
        {
            id: 2,
            clientId: 1,
            status: OrderStatus.ATTENTE_PAIMENT,
            createdAt: new Date("2024-06-01T15:30:00Z"),
            amount: 75.00,
            deliveryFees: 0,
            withoutVAT: false,
            quotation: false,
            deliveryMode: OrderDeliveryMode.COLISSIMO,
            usedCredit: 0,
            totalDiscount: 0,
            authorisation: "",
            paymentMode: "",
            authorisationDate: new Date()
        },
        {
            id: 3,
            clientId: 2,
            status: OrderStatus.AUTRE_1,
            createdAt: new Date("2024-04-15T09:20:00Z"),
            amount: 200.00,
            deliveryFees: 0,
            withoutVAT: false,
            quotation: false,
            deliveryMode: OrderDeliveryMode.COLISSIMO,
            usedCredit: 0,
            totalDiscount: 0,
            authorisation: "",
            paymentMode: "",
            authorisationDate: new Date()
        }
    ];

    SharedMemory.returns = [
        {
            id: 1,
            id_commande: 1,
            type_retour: "RETOUR_PRODUIT",
            date_demande: new Date("2024-06-10T09:00:00Z"),
            date_reception: new Date("2024-06-12T14:00:00Z"),
            numero_suivi: "SU123456789FR",
            numero_prise_en_charge: "PC1001",
            cab_routage: "CBR001",
            date_commande_recu_le: new Date("2024-06-11T10:00:00Z"),
            motif_retour: "Produit défectueux",
            date_remboursement: new Date("2024-06-15T16:00:00Z"),
            date_reexpedition: new Date("2024-06-13T11:00:00Z"),
            etat: "REMBOURSE"
        },
        {
            id: 2,
            id_commande: 2,
            type_retour: "RETOUR_TAILLE",
            date_demande: new Date("2024-06-05T10:30:00Z"),
            date_reception: new Date("2024-06-07T13:00:00Z"),
            numero_suivi: "SU987654321FR",
            numero_prise_en_charge: "PC1002",
            cab_routage: "CBR002",
            date_commande_recu_le: new Date("2024-06-06T09:00:00Z"),
            motif_retour: "Mauvaise taille",
            date_remboursement: new Date("2024-06-10T15:00:00Z"),
            date_reexpedition: new Date("2024-06-08T12:00:00Z"),
            etat: "EN_COURS"
        },
        {
            id: 3,
            id_commande: 3,
            type_retour: "RETOUR_CHANGEMENT",
            date_demande: new Date("2024-05-20T11:00:00Z"),
            date_reception: new Date("2024-05-22T15:00:00Z"),
            numero_suivi: "SU555555555FR",
            numero_prise_en_charge: "PC2001",
            cab_routage: "CBR003",
            date_commande_recu_le: new Date("2024-05-21T10:00:00Z"),
            motif_retour: "Changement d'avis",
            date_remboursement: new Date("2024-05-25T17:00:00Z"),
            date_reexpedition: new Date("2024-05-23T13:00:00Z"),
            etat: "REFUSE"
        }
    ];

    SharedMemory.creditNotes = [
        {
            id: 1,
            clientId: 1001,
            orderId: 1,
            total: 50.00,
            createdAt: new Date("2024-06-01T10:00:00Z"),
            expiredAt: new Date("2024-12-01T10:00:00Z"),
            used: false,
            type: CreditNoteType.REMBOURSEMENT,
            remainingAmount: 50.00
        },
        {
            id: 2,
            clientId: 1001,
            orderId: 2,
            total: 30.00,
            createdAt: new Date("2024-05-15T09:00:00Z"),
            expiredAt: new Date("2024-11-15T09:00:00Z"),
            used: true,
            type: CreditNoteType.REMBOURSEMENT,
            remainingAmount: 0.00
        },
        {
            id: 3,
            clientId: 1002,
            orderId: 3,
            total: 80.00,
            createdAt: new Date("2024-04-20T14:00:00Z"),
            expiredAt: new Date("2024-10-20T14:00:00Z"),
            used: false,
            type: CreditNoteType.REMBOURSEMENT,
            remainingAmount: 80.00
        }
    ];

    SharedMemory.discounts = [
        {
            id: 1,
            etat: DiscountState.ACTIVE,
            nom: "Réduction de bienvenue",
            type: ReductionType.CLUB,
            id_club: 1,
            code: "WELCOME10",
            combinaison: DiscountCombination.COMMANDE,
            boutique: ProductShop.NATAQUASHOP,
            date_debut: new Date("2024-06-01T00:00:00Z"),
            date_fin: new Date("2024-07-01T00:00:00Z"),
            id_user: "1",
            type_condition_achat_min: MinPurchaseCondition.MONTANT,
            valeur_condition_achat_min: 50.00,
            nombre_maximal_utilisation: 1,
            discountLines: []
        },
        {
            id: 2,
            etat: DiscountState.ACTIVE,
            nom: "Réduction fidélité",
            type: ReductionType.CLUB,
            id_club: 1,
            code: "FIDELITE5",
            combinaison: DiscountCombination.EXPEDITION,
            boutique: ProductShop.NATAQUASHOP,
            date_debut: new Date("2024-05-15T00:00:00Z"),
            date_fin: new Date("2024-08-15T00:00:00Z"),
            id_user: "1",
            type_condition_achat_min: MinPurchaseCondition.MONTANT,
            valeur_condition_achat_min: 100.00,
            nombre_maximal_utilisation: 3,
            discountLines: []
        },
        {
            id: 3,
            etat: DiscountState.INACTIVE,
            nom: "Promo printemps",
            type: ReductionType.AVOIR,
            id_club: 2,
            code: "SPRING20",
            combinaison: DiscountCombination.PRODUIT,
            boutique: ProductShop.NATAQUASHOP,
            date_debut: new Date("2024-03-01T00:00:00Z"),
            date_fin: new Date("2024-04-01T00:00:00Z"),
            id_user: "2",
            type_condition_achat_min: MinPurchaseCondition.MONTANT,
            valeur_condition_achat_min: 30.00,
            nombre_maximal_utilisation: 2,
            discountLines: []
        }
    ];
    SharedMemory.addresses=[{
        id: 1,
        numero_client: 1,
        designation: "adresse facturation",
        civilite: "Mr",
        nom: "Dupont",
        prenom: "Marie",
        adresse: "3 rue jasmine",
        adresse2: "2 etage",
        adresse3: "bat 3",
        code_postal: "44000",
        ville: "nantes",
        pays: "Fr",
        interphone: "",
        code_porte: "",
        instructions: "",
        default: false,
        created_at: new Date(),
        updated_at: new Date(),
        societe: ""
    }];
   
}

export const teardown = () => {
    SharedMemory.clear();
}