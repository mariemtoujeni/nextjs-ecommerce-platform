import { SharedMemory } from "@repo/core/adapters/mock";
import { ClientType, UserRoles } from "../../../src/models";

export const setup = async () => {
  SharedMemory.users = [
        { id: "1", email: "admin@admin.com", user_role: UserRoles.SUPER_ADMIN, 
          first_name: "Admin", last_name: "Admin", password: "admin", is_anonymous: false },
  ]
  SharedMemory.clients = [
       {
           userId: "1",
           email: "admin@admin.com",
           lastName: "",
           firstName: "",
           phone: "",
           mobilePhone: "",
           workPhone: "",
           clubMemberId: 0,
           clubId: 0,
           clientNumber: 0,
           type: ClientType.CLIENT,
           lang: "",
           newsLetter: false,
           siteOffer: false,
           partnerOffer: false,
           credit: 0,
           fidelityPoints: 0,
           birthDate: new Date(),
           clientAddress: [],
           order: [],
           quotation: [],
           createdAt: ""
       },
    ]
  SharedMemory.productAlerts = [
    {
      id: 1,
      clientNumber: 12345,
      client: {
        userId: "1526",
        email: "user1@example.com",
        firstName: "test",
        lastName: "user",
      },
      idModel: 101,
      model: {
        id: 30,
        productId: 30,
        weight: 20,
        priceWithoutVat: 25,
        priceWithVat: 30,
        published: true,
        minStock: 30,
        productDetails: {
          descriptions: [{ lang: "fr", title: "Maillot une pièce noir", description: "Maillot classique pour la plage" }],
          images: [{ productId: 30, attributeValueId: 1, url: "https://example.com/swimsuit1.jpg" }]
        },
        attributValues: []
      },
      email: "user1@example.com",
      createdAt: new Date("2023-01-01T10:00:00Z"),
      isActif: true,
      isEmailSent: false,
    },
    {
      id: 2,
      clientNumber: 67890,
      client: {
        userId: "1526",
        email: "user2@example.com",
        firstName: "testuser",
        lastName: "testuser"
      },
      idModel: 202,
      model: {
        id: 22,
        productId: 222,
        weight: 30,
        priceWithoutVat: 79.16,
        priceWithVat: 94.99,
        published: true,
        minStock: 10,
        productDetails: {
          descriptions: [{ lang: "fr", title: "Maillot une pièce bleu", description: "Maillot de bain une pièce avec motif marin" }],
          images: [{ productId: 222, attributeValueId: 2, url: "https://example.com/swimsuit2.jpg" }]
        },
        attributValues: [],
      },
      email: "user2@example.com",
      createdAt: new Date("2023-05-15T14:30:00Z"),
      isActif: false,
      isEmailSent: true,
    },
    {
      id: 3,
      clientNumber: 11111,
      client: {
        userId: "1526",
        email: "user3@example.com",
        firstName: "test",
        lastName: "squaad"
      },
      idModel: 303,
      model: {
        id: 33,
        productId: 222,
        weight: 30,
        priceWithoutVat: 79.16,
        priceWithVat: 94.99,
        published: true,
        minStock: 10,
        productDetails: {
          descriptions: [{ lang: "fr", title: "Maillot une pièce bleu", description: "Maillot de bain une pièce avec motif marin" }],
          images: [{ productId: 222, attributeValueId: 2, url: "https://example.com/swimsuit2.jpg" }]
        },
        attributValues: [],
      },
      email: "user3@example.com",
      createdAt: new Date("2024-03-20T08:15:00Z"),
      isActif: true,
      isEmailSent: true,
    },
    {
      id: 4,
      clientNumber: 99999,
      client: {
        userId: "1527",
        email: "jane@example.com",
        firstName: "jane",
        lastName: "doe"
      },
      idModel: 404,
      model: {
        id: 44,
        productId: 333,
        weight: 10,
        priceWithoutVat: 24.99,
        priceWithVat: 29.99,
        published: true,
        minStock: 20,
        productDetails: {
          descriptions: [{ lang: "fr", title: "T-shirt col rond blanc", description: "T-shirt basique en coton doux" }],
          images: [{ productId: 333, attributeValueId: 3, url: "https://example.com/tshirt1.jpg" }]
        },
        attributValues: [],
      },
      email: "jane@example.com",
      createdAt: new Date("2024-04-01T09:00:00Z"),
      isActif: true,
      isEmailSent: false,
    },
    {
      id: 5,
      clientNumber: 88888,
      client: {
        userId: "1528",
        email: "john@example.com",
        firstName: "john",
        lastName: "smith"
      },
      idModel: 505,
      model: {
        id: 55,
        productId: 444,
        weight: 15,
        priceWithoutVat: 49.99,
        priceWithVat: 59.99,
        published: true,
        minStock: 12,
        productDetails: {
          descriptions: [{ lang: "fr", title: "Baskets légères", description: "Chaussures de sport légères pour usage quotidien" }],
          images: [{ productId: 444, attributeValueId: 4, url: "https://example.com/shoes1.jpg" }]
        },
        attributValues: [],
      },
      email: "john@example.com",
      createdAt: new Date("2024-04-15T11:00:00Z"),
      isActif: true,
      isEmailSent: true,
    },
    {
      id: 6,
      clientNumber: 77777,
      client: {
        userId: "1529",
        email: "alice@example.com",
        firstName: "alice",
        lastName: "wonder"
      },
      idModel: 606,
      model: {
        id: 66,
        productId: 555,
        weight: 5,
        priceWithoutVat: 16.66,
        priceWithVat: 19.99,
        published: true,
        minStock: 8,
        productDetails: {
          descriptions: [{ lang: "fr", title: "Chapeau de soleil", description: "Protection élégante contre le soleil" }],
          images: [{ productId: 555, attributeValueId: 5, url: "https://example.com/hat1.jpg" }]
        },
        attributValues: [],
      },
      email: "alice@example.com",
      createdAt: new Date("2024-04-18T10:30:00Z"),
      isActif: false,
      isEmailSent: false,
    },
    {
      id: 7,
      clientNumber: 11223,
      client: {
        userId: "1530",
        email: "charlie@example.com",
        firstName: "charlie",
        lastName: "delta"
      },
      idModel: 707,
      model: {
        id: 77,
        productId: 666,
        weight: 7,
        priceWithoutVat: 33.33,
        priceWithVat: 39.99,
        published: true,
        minStock: 18,
        productDetails: {
          descriptions: [{ lang: "fr", title: "Short de sport", description: "Short respirant pour entraînement intensif" }],
          images: [{ productId: 666, attributeValueId: 6, url: "https://example.com/short1.jpg" }]
        },
        attributValues: [],
      },
      email: "charlie@example.com",
      createdAt: new Date("2024-05-10T07:45:00Z"),
      isActif: true,
      isEmailSent: false,
    },
    {
      id: 8,
      clientNumber: 33445,
      client: {
        userId: "1531",
        email: "david@example.com",
        firstName: "david",
        lastName: "rose"
      },
      idModel: 808,
      model: {
        id: 88,
        productId: 777,
        weight: 12,
        priceWithoutVat: 66.66,
        priceWithVat: 79.99,
        published: true,
        minStock: 10,
        productDetails: {
          descriptions: [{ lang: "fr", title: "Veste légère", description: "Veste mi-saison confortable" }],
          images: [{ productId: 777, attributeValueId: 7, url: "https://example.com/jacket1.jpg" }]
        },
        attributValues: [],
      },
      email: "david@example.com",
      createdAt: new Date("2024-05-12T12:00:00Z"),
      isActif: true,
      isEmailSent: false,
    },
    {
      id: 9,
      clientNumber: 55667,
      client: {
        userId: "1532",
        email: "emma@example.com",
        firstName: "emma",
        lastName: "green"
      },
      idModel: 909,
      model: {
        id: 99,
        productId: 888,
        weight: 8,
        priceWithoutVat: 58.33,
        priceWithVat: 69.99,
        published: true,
        minStock: 5,
        productDetails: {
          descriptions: [{ lang: "fr", title: "Robe d'été", description: "Robe légère et fluide pour les journées chaudes" }],
          images: [{ productId: 888, attributeValueId: 8, url: "https://example.com/dress1.jpg" }]
        },
        attributValues: [],
      },
      email: "emma@example.com",
      createdAt: new Date("2024-05-20T13:15:00Z"),
      isActif: false,
      isEmailSent: true,
    },
    {
      id: 10,
      clientNumber: 77889,
      client: {
        userId: "1533",
        email: "lucas@example.com",
        firstName: "lucas",
        lastName: "brown"
      },
      idModel: 1001,
      model: {
        id: 100,
        productId: 999,
        weight: 18,
        priceWithoutVat: 41.66,
        priceWithVat: 49.99,
        published: true,
        minStock: 14,
        productDetails: {
          descriptions: [{ lang: "fr", title: "Jean slim", description: "Jean ajusté tendance pour toutes saisons" }],
          images: [{ productId: 999, attributeValueId: 9, url: "https://example.com/jeans1.jpg" }]
        },
        attributValues: [],
      },
      email: "lucas@example.com",
      createdAt: new Date("2024-05-22T15:45:00Z"),
      isActif: true,
      isEmailSent: false,
    }
  ];
};

export const teardown = async () => {
  SharedMemory.clear();
};
