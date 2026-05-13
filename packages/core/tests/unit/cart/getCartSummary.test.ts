import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCartSummaryUseCase } from "@repo/core/usecases";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { setup, teardown } from "./_Setup";
import { ReductionValueType } from "@repo/core/models";

describe("Get cart summary", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should return correct cart summary for signed-in user", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("jean.dupont@email.com", "test");

    const summary = await getCartSummaryUseCase();
    expect(summary).toBeDefined();

    const expectedSubTotalWithoutVAT = 81.81 * 2 + 27.26 * 1; 
    expect(summary.subTotalWithoutVAT).toBeCloseTo(expectedSubTotalWithoutVAT, 2);

    const expectedSubTotalWithVAT = 89.99 * 2 + 29.99 * 1; 
    expect(summary.subTotalWithVAT).toBeCloseTo(expectedSubTotalWithVAT, 2);

    const totalWithoutVAT = expectedSubTotalWithoutVAT; 

    const discount1 = totalWithoutVAT * 0.10; 
    const discount2 = 5;                       
    const expectedDiscount = discount1 + discount2; 
    expect(Number(summary.discount.toFixed(2))).toBe(Number(expectedDiscount.toFixed(2))); 

    const expectedDeliveryTTC = 11;
    expect(summary.deliveryTTC).toBe(expectedDeliveryTTC);

    //total calculation
    const discountedWithoutVAT = totalWithoutVAT - expectedDiscount; 
    const vatRate = (expectedSubTotalWithVAT - expectedSubTotalWithoutVAT) / expectedSubTotalWithoutVAT; 
    const expectedTotal = discountedWithoutVAT + expectedDeliveryTTC + discountedWithoutVAT * vatRate; 

    expect(summary.total).toBeCloseTo(expectedTotal, 2);


    await authService.signOut();
  });

  it("should throw UnauthorizedError if no user is signed in", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signOut();

    await expect(getCartSummaryUseCase()).rejects.toThrow(UnauthorizedError);
  });
});
