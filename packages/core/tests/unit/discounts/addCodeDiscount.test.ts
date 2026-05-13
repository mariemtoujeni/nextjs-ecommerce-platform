import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { addCodeDiscount } from "../../../src/usecases/discounts/addCodeDiscount";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";
import { CodeType, DiscountState } from "../../../src/models";
import { UnauthorizedError } from "../../../src/types/error";
import { getDiscountByIdUseCase, updateDiscountUseCase } from "@repo/core/usecases"; 
import { SharedMemory } from "@repo/core/adapters/mock";

const activateOnly = async (ids: number[]) => {
  const allIds = SharedMemory.discounts.map(d => d.id);
  for (const id of allIds) {
    const discount = await getDiscountByIdUseCase(id);
    const { discountLines, ...discountWithoutLines } = discount;
    await updateDiscountUseCase({ ...discountWithoutLines, etat: ids.includes(id) ? DiscountState.ACTIVE : DiscountState.INACTIVE });
  }
};

describe("addCodeDiscount", () => {

  beforeEach(async () => {
    await setup();
  });

  afterEach(async () => {
    await teardown();
  });

  it("should throw UnauthorizedError if no user is logged in", async () => {
    await expect(addCodeDiscount("PROMO123", CodeType.CODE_PROMO)).rejects.toThrow(UnauthorizedError);
  });

  it("should return false if code is invalid", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    await activateOnly([5,3]);
    const result = await addCodeDiscount("INVALID", CodeType.CODE_PROMO);
    expect(result).toBe(false);
    await authService.signOut();
  });

  it("should return false if no line is found", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    await activateOnly([3]);
    const result = await addCodeDiscount("CADEAUX25", CodeType.CODE_PROMO);
    expect(result).toBe(false); 
    await authService.signOut();
  });


  it("should add CODE_PROMO when valid and return true", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    await activateOnly([5,3]);
    const result = await addCodeDiscount("PROMO20", CodeType.CODE_PROMO);
    expect(result).toBe(true);
    await authService.signOut();
  });


});
