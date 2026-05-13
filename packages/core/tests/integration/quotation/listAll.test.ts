import { describe, it, expect } from "vitest";
import { listAllQuotationsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { Quotation } from "@repo/core/models";

describe("listAllQuotationsUseCase", () => {

  it("should return all quotations", async () => {
    await signInTestUser(TestUser.ADMIN);
    let quotations = await listAllQuotationsUseCase();
    expect(quotations.items.length).toBeGreaterThan(0);
    expect(quotations.total).toBeGreaterThan(0);
    expect(quotations.count).toEqual(quotations.items.length);

    expect(quotations.items[0]?.id).toBeGreaterThan(quotations.items[1]?.id ?? 0);

    quotations = await listAllQuotationsUseCase({ sort: "asc" });
    expect(quotations.items[0]?.id).toBeLessThan(quotations.items[1]?.id ?? 0);
    
    const item = quotations.items[0] as Quotation;
    expect(item.id).toBeDefined();
    expect(item.title).toBeDefined();
    expect(item.status).toBeDefined();
    expect(item.deliveryMode).toBeDefined();
    expect(item.clientNumber).toBeDefined();
    expect(item.totalAmount).toBeDefined();
    expect(item.withoutTVA).toBeDefined();
    expect(item.usedCredit).toBeDefined();
    expect(item.createdAt).toBeDefined();
  })
});
