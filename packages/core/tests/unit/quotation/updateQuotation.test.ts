import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateQuotationUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { OrderDeliveryMode, Quotation, QuotationStatus } from '@repo/core/models';

describe("updateQuotationUseCase", () => {
  beforeEach(setup);

  afterEach(teardown);

  it("should update an existing quotation", async () => {
    const updatedQuotation: Quotation = {
            id: 10,
            title: "Quotation 10 updated",
            orderId: 112,
            clubId: 50,
            status: QuotationStatus.VALIDE,
            totalAmount: 145.00,
            shippingFees: 10,
            rest: 135,
            withoutTVA: false,
            totalDiscount: 0,
            clientComment: "",
            usedCredit: 0,
            version: 1,
            clientNumber: 10,
            createdAt: new Date("2024-05-25"),
            deliveryMode: OrderDeliveryMode.AU_MAGASIN,
    };

    const quotation = await updateQuotationUseCase(updatedQuotation);
    expect(quotation.id).toBe(10);
    expect(quotation.title).toBe("Quotation 10 updated");
    expect(quotation.status).toBe(QuotationStatus.VALIDE);
    expect(quotation.deliveryMode).toBe(OrderDeliveryMode.AU_MAGASIN);
  });
});
