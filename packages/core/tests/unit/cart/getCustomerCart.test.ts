import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listCartItemsUseCase } from "@repo/core/usecases";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { setup, teardown } from "./_Setup";

describe("List cart items", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should return cart items for signed-in user", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("jean.dupont@email.com", "test");

    const cartItems = await listCartItemsUseCase();

    expect(cartItems).toBeDefined();
    expect(cartItems.length).toBeGreaterThan(0);

    expect(cartItems[0]).toMatchObject({
      userId: "user1",
      modelId: 1,
      quantity: 2,
      price: 89.99,
    });

    await authService.signOut();
  });

  it("should return cart items for anonymous user when anon_userId is provided", async () => {
    const anonCartItems = await listCartItemsUseCase("user4"); 

    expect(anonCartItems).toBeDefined();
    expect(anonCartItems.length).toBeGreaterThan(0);

    expect(anonCartItems[0]).toMatchObject({
      userId: "user4",
      modelId: 3,
      quantity: 2,
      price: 79.99,
    });
  });

  it("should throw UnauthorizedError if no user is signed in and no anon_userId provided", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signOut();

    await expect(listCartItemsUseCase()).rejects.toThrow(UnauthorizedError);
  });
});
