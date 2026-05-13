import { SharedMemory } from "@repo/core/adapters/mock";
import { ClientType, Discount, DiscountCombination, DiscountState,
         DiscountTypeProduct, DiscountTypeValue, 
         MinPurchaseCondition, ModelProduct, ProductShop, ProductStatus, ReductionType, ReductionValueType, TypeDiscount, 
         UserRoles} from "@repo/core/models";

export const setup = () => {
  
  SharedMemory.users = [
      { id: "1", email: "admin@admin.com", user_role: UserRoles.SUPER_ADMIN, first_name: "Admin", last_name: "Admin", password: "admin", is_anonymous: false },
  ]

  SharedMemory.clients = [
    {
      userId: "1",
      clubId: 123,
      clubMemberId: 7895869, //si 0 s'associe avec une réduction avec clubId=0 confusion!
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      mobilePhone: "",
      workPhone: "",
      clientNumber: 0,
      type: ClientType.CLUB,
      lang: "",
      birthDate: new Date(),
      newsLetter: false,
      siteOffer: false,
      partnerOffer: false,
      fidelityPoints: 0,
      credit: 0,
      createdAt: "",
      clientAddress: [],
      order: [],
      quotation: []
    }
  ];
  
  SharedMemory.discounts = [
    // 20% off category 201 for first test
    {
      id: 1,
      etat: DiscountState.INACTIVE,
      nom: "20pct Maillot 201",
      type: ReductionType.CAMPAGNE,
      id_club: 0,
      code: "",
      combinaison: DiscountCombination.PRODUIT,
      boutique: ProductShop.NATAQUASHOP,
      date_debut: new Date("2024-07-20"),
      date_fin: new Date("2026-08-1"),
      id_user: "",
      type_condition_achat_min: MinPurchaseCondition.MONTANT,
      valeur_condition_achat_min: 0,
      nombre_maximal_utilisation: 999,
      discountLines: [
        {
          id: 101,
          id_type: 201,
          id_reduction: 11,
          country_code: "FR",
          type: DiscountTypeProduct.CATEGORIE,
          type_valeur: ReductionValueType.PERCENTAGE,
          valeur: 60,
          discount: {} as Discount
        }
      ]
    },
    // €15 off category 202 for second test
    {
      id: 2,
      etat: DiscountState.INACTIVE,
      nom: "15eur Cat 202",
      type: ReductionType.CAMPAGNE,
      id_club: 0,
      code: "",
      combinaison: DiscountCombination.COMMANDE,
      boutique: ProductShop.NATAQUASHOP,
      date_debut: new Date(),
      date_fin: new Date(new Date().getTime() + 1000 * 60 * 60 * 24),
      id_user: "test",
      type_condition_achat_min: MinPurchaseCondition.MONTANT,
      valeur_condition_achat_min: 0,
      nombre_maximal_utilisation: 999,
      discountLines: [
        {
          id: 102,
          id_type: 202,
          id_reduction: 12,
          country_code: "FR",
          type: DiscountTypeProduct.CATEGORIE,
          type_valeur: ReductionValueType.MONTANT,
          valeur: 15,
          discount: {} as Discount
        }
      ]
    },
    {
      id: 3,
      etat: DiscountState.INACTIVE,
      nom: "Chèque Cadeau Noël",
      type: ReductionType.CODE_PROMO,
      id_club: 103,
      code: "CADEAUX25",
      combinaison: DiscountCombination.COMMANDE,
      boutique: ProductShop.CRAZYSWIM,
      date_debut: new Date("2024-12-01"),
      date_fin: new Date("2026-12-25"),
      id_user: "user_3",
      type_condition_achat_min: MinPurchaseCondition.MONTANT,
      valeur_condition_achat_min: 100,
      nombre_maximal_utilisation: 200,
      discountLines: [
        {
          id: 3,
          id_type: 789,
          id_reduction: 3,
          country_code: "FR",
          type: DiscountTypeProduct.MODELE,
          type_valeur: ReductionValueType.MONTANT,
          valeur: 25,
          discount: {} as Discount
        }
      ]
    },
    {
      id: 4,
      etat: DiscountState.INACTIVE,
      nom: "Frais d'expédition offerts",
      type: ReductionType.EXPEDITION,
      id_club: 104,
      code: "",
      combinaison: DiscountCombination.EXPEDITION,
      boutique: ProductShop.NATAQUASHOP,
      date_debut: new Date("2024-07-01"),
      date_fin: new Date("2026-07-31"),
      id_user: "",
      type_condition_achat_min: MinPurchaseCondition.MONTANT,
      valeur_condition_achat_min: 75,
      nombre_maximal_utilisation: 500,
      discountLines: [
        {
          id: 4,
          id_type: 0,
          id_reduction: 4,
          country_code: "FR",
          type: DiscountTypeProduct.EXPEDITION,
          type_valeur: ReductionValueType.MONTANT,
          valeur: 8,
          discount: {} as Discount
        }
      ]
    },
    {
      id: 5,
      etat: DiscountState.INACTIVE,
      nom: "Réduction Première Commande",
      type: ReductionType.CAMPAGNE,
      id_club: 105,
      code: "PROMO20",
      combinaison: DiscountCombination.COMMANDE,
      boutique: ProductShop.SWIMWEAR,
      date_debut: new Date("2024-01-01"),
      date_fin: new Date("2027-03-01"),
      id_user: "",
      type_condition_achat_min: MinPurchaseCondition.MONTANT,
      valeur_condition_achat_min: 0,
      nombre_maximal_utilisation: 1,
      discountLines: [
        {
          id: 5,
          id_type: 1,
          id_reduction: 5,
          country_code: "",
          type: DiscountTypeProduct.PRODUIT,
          type_valeur: ReductionValueType.MONTANT,
          valeur: 10,
          discount: {} as Discount
        }
      ]
    },
    {
      id: 6,
      etat: DiscountState.INACTIVE,
      nom: "Promo 2 Pour 1",
      type: ReductionType.X_POUR_Y,
      id_club: 106,
      code: "2POUR1",
      combinaison: DiscountCombination.PRODUIT,
      boutique: ProductShop.CRAZYSWIM,
      date_debut: new Date("2024-07-10"),
      date_fin: new Date("2024-08-10"),
      id_user: "user_6",
      type_condition_achat_min: MinPurchaseCondition.QUANTITE_PRODUIT,
      valeur_condition_achat_min: 2,
      nombre_maximal_utilisation: 300,
      discountLines: [
        {
          id: 6,
          id_type: 888,
          id_reduction: 6,
          country_code: "FR",
          type: DiscountTypeProduct.MODELE,
          type_valeur: ReductionValueType.PERCENTAGE,
          valeur: 50,
          discount: {} as Discount
        }
      ]
    },
    {
      id: 7,
      etat: DiscountState.INACTIVE,
      nom: "Campagne Été",
      type: ReductionType.CAMPAGNE,
      id_club: 107,
      code: "CAMPAGNE2024",
      combinaison: DiscountCombination.COMMANDE,
      boutique: ProductShop.NATAQUASHOP,
      date_debut: new Date("2024-05-01"),
      date_fin: new Date("2024-06-15"),
      id_user: "user_7",
      type_condition_achat_min: MinPurchaseCondition.MONTANT,
      valeur_condition_achat_min: 60,
      nombre_maximal_utilisation: 150,
      discountLines: [
        {
          id: 7,
          id_type: 456,
          id_reduction: 7,
          country_code: "FR",
          type: DiscountTypeProduct.SOUS_CATEGORIE,
          type_valeur: ReductionValueType.PERCENTAGE,
          valeur: 15,
          discount: {} as Discount
        }
      ]
    },
    {
      id: 8,
      etat: DiscountState.INACTIVE,
      nom: "Club promo",
      type: ReductionType.CLUB,
      id_club: 123,
      code: "",
      combinaison: DiscountCombination.COMMANDE,
      boutique: ProductShop.NATAQUASHOP,
      date_debut: new Date("2024-07-20"),
      date_fin: new Date("2026-08-1"),
      id_user: "",
      type_condition_achat_min: MinPurchaseCondition.MONTANT,
      valeur_condition_achat_min: 35,
      nombre_maximal_utilisation: 500,
      discountLines: [
        {
          id: 8,
          id_type: 1001,
          id_reduction: 8,
          country_code: "FR",
          type: DiscountTypeProduct.PRODUIT,
          type_valeur: ReductionValueType.PERCENTAGE,
          valeur: 50,
          discount: {} as Discount
        }
      ]
    },
    {
      id: 9,
      etat: DiscountState.INACTIVE,
      nom: "Réduc Club Adhérent",
      type: ReductionType.ADHERENT_CLUB,
      id_club: 109,
      code: "ADHERENT15",
      combinaison: DiscountCombination.COMMANDE,
      boutique: ProductShop.CRAZYSWIM,
      date_debut: new Date("2024-07-01"),
      date_fin: new Date("2024-12-31"),
      id_user: "user_9",
      type_condition_achat_min: MinPurchaseCondition.MONTANT,
      valeur_condition_achat_min: 20,
      nombre_maximal_utilisation: 1000,
      discountLines: [
        {
          id: 9,
          id_type: 321,
          id_reduction: 9,
          country_code: "FR",
          type: DiscountTypeProduct.MARQUE,
          type_valeur: ReductionValueType.PERCENTAGE,
          valeur: 15,
          discount: {} as Discount
        }
      ]
    },
    {
      id: 10,
      etat: DiscountState.INACTIVE,
      nom: "Offre Été Spéciale",
      type: ReductionType.CAMPAGNE,
      id_club: 110,
      code: "ETEEXCLU",
      combinaison: DiscountCombination.EXPEDITION,
      boutique: ProductShop.NATAQUASHOP,
      date_debut: new Date("2024-07-15"),
      date_fin: new Date("2024-08-15"),
      id_user: "user_10",
      type_condition_achat_min: MinPurchaseCondition.MONTANT,
      valeur_condition_achat_min: 80,
      nombre_maximal_utilisation: 100,
      discountLines: [
        {
          id: 10,
          id_type: 0,
          id_reduction: 10,
          country_code: "FR",
          type: DiscountTypeProduct.EXPEDITION,
          type_valeur: ReductionValueType.MONTANT,
          valeur: 6,
          discount: {} as Discount
        }
      ]
    }
  ] satisfies Discount[];

  SharedMemory.discountLines = [
    {
          id: 3,
          id_type: 789,
          id_reduction: 3,
          country_code: "FR",
          type: DiscountTypeProduct.MODELE,
          type_valeur: ReductionValueType.MONTANT,
          valeur: 25,
          discount: {      
            id: 3,
            etat: DiscountState.ACTIVE,
            nom: "Chèque Cadeau Noël",
            type: ReductionType.CODE_PROMO,
            id_club: 103,
            code: "CADEAUX25",
            combinaison: DiscountCombination.COMMANDE,
            boutique: ProductShop.CRAZYSWIM,
            date_debut: new Date("2024-12-01"),
            date_fin: new Date("2026-12-25"),
            id_user: "user_3",
            type_condition_achat_min: MinPurchaseCondition.MONTANT,
            valeur_condition_achat_min: 100,
            nombre_maximal_utilisation: 200,} as Discount
    },
    {
          id: 5,
          id_type: 1,
          id_reduction: 5,
          country_code: "",
          type: DiscountTypeProduct.PRODUIT,
          type_valeur: ReductionValueType.MONTANT,
          valeur: 10,
          discount: {      
            id: 5,
            etat: DiscountState.ACTIVE,
            nom: "Réduction Première Commande",
            type: ReductionType.CAMPAGNE,
            id_club: 105,
            code: "PROMO20",
            combinaison: DiscountCombination.COMMANDE,
            boutique: ProductShop.SWIMWEAR,
            date_debut: new Date("2024-01-01"),
            date_fin: new Date("2027-03-01"),
            id_user: "",
            type_condition_achat_min: MinPurchaseCondition.MONTANT,
            valeur_condition_achat_min: 40,
            nombre_maximal_utilisation: 1,} as Discount
      }
  ];
  SharedMemory.cart = [
      {
        userId: "1",
        modelId: 889988,
        model: {} as ModelProduct,
        quantity: 1,
        shipping: "",
        customization: false,
        text: "",
        price: 50,
        discountType: ReductionType.CAMPAGNE,
        discountValueType: ReductionValueType.MONTANT,
        discountValue: 20,
        discountInfo: "",
        textPersonalisation: "",
        typePersonalisation: ""
      },
  ]
  SharedMemory.models = [
      { 
        id: 889988, 
        productId: 1, 
        weight: 3, 
        priceWithoutVat: 100, 
        priceWithVat: 120, 
        published: true, 
        minStock: 15, 
        purchasePrice: 100, 
        barcode: "1234567890", 
        supplierReference: "1234567890", 
        manufacturerReference: "1234567890", 
        attributValues: []
      },
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
      ]
};


export const teardown = () => {
    SharedMemory.clear();
};
