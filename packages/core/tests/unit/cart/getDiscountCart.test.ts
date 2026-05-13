import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getDiscountCartUseCase } from "@repo/core/usecases";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { setup, teardown } from "./_Setup";

describe("Get discount cart", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should return discount cart for signed-in user", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("jean.dupont@email.com", "test"); 

    const discountCart = await getDiscountCartUseCase();

    expect(discountCart).toBeDefined();

    if (discountCart && Array.isArray(discountCart)) {
      expect(discountCart.length).toBeGreaterThanOrEqual(0);
    }

    await authService.signOut();
  });

  it("should throw UnauthorizedError if no user is signed in", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signOut();

    await expect(getDiscountCartUseCase()).rejects.toThrow(UnauthorizedError);
  });
});
