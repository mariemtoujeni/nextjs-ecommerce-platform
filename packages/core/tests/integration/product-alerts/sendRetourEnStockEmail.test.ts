import { describe, expect, it } from "vitest";
import { sendRetourEnStockEmailUseCase } from "@repo/core/usecases";
import { ProductAlert } from "@repo/core/models";




describe("sendRetourEnStockEmailUseCase", () => {

  let insertedAlert: ProductAlert = {
    id: 9999,
    clientNumber: 123456,
    client: {
      userId: "1526",
      email: process.env.TEST_NOTIFICATION_EMAIL || "dev-null@example.com",
      firstName: "TESTSQUAD",
      lastName: "CLIENT"
    },
    idModel: 10101,
    model: {
      id: 100,
      productId: 999,
      weight: 18,
      priceWithoutVat: 41.66,
      priceWithVat: 49.99,
      published: true,
      minStock: 14,
      productDetails: {
        descriptions: [{ lang: "fr", title: "Short de bain bleu marine", description: "Short de bain pour homme, résistant à l'eau salée et au chlore" }],
        images: [{ productId: 99999, url: "https://example.com/mens-swimshort.jpg", attributeValueId: 1 }]
      },
      attributValues: [],
    },
    email: process.env.TEST_NOTIFICATION_EMAIL || "dev-null@example.com",
    createdAt: new Date("2023-01-01T10:00:00Z"),
    isActif: true,
    isEmailSent: false
  };

  it("should send notification email via email service", async () => {
    const result = await sendRetourEnStockEmailUseCase(insertedAlert);
    expect(result).toBe(true);
  });
});
