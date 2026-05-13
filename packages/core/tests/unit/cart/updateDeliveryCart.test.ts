import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateDeliveryCartUseCase } from "@repo/core/usecases";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { OrderDeliveryMode } from "@repo/core/models";
import { setup, teardown } from "./_Setup";

describe("Update delivery cart", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should update delivery cart successfully", async () => {
    const authService = await getInjection("IAuthenticationService");

    await authService.signIn("user4@email.com", "test");

    const updatedCart = await updateDeliveryCartUseCase({
      weight: 3.5,
    });

    expect(updatedCart).toBeDefined();
    expect(updatedCart.userId).toBe("user4");
    expect(updatedCart.weight).toBe(3.5);
    expect(updatedCart.prix).toBeGreaterThan(0);

    await authService.signOut();
  });

  it("should throw UnauthorizedError if no user is signed in", async () => {
    await expect(
      updateDeliveryCartUseCase({ weight: 5 })
    ).rejects.toThrow(UnauthorizedError);
  });

  it("should throw if no delivery cart exists for user", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("marie.martin@email.com", "test");

    await expect(
      updateDeliveryCartUseCase({ weight: 5 })
    ).rejects.toThrow("No delivery cart to update");

    await authService.signOut();
  });

  it("should throw if user has no default address", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("user5@email.com", "test");

    await expect(
      updateDeliveryCartUseCase({ weight: 2 })
    ).rejects.toThrow("No default address found");

    await authService.signOut();
  });

  it("should set prix = 0 if delivery mode is AU_MAGASIN", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("jean.dupont@email.com", "test");

    const updatedCart = await updateDeliveryCartUseCase({
      deliveryMode: OrderDeliveryMode.AU_MAGASIN,
    });

    expect(updatedCart).toBeDefined();
    expect(updatedCart.userId).toBe("user1");
    expect(updatedCart.prix).toBe(0);

    await authService.signOut();
  });

  it("should recalculate delivery price when delivery mode is not AU_MAGASIN", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("user4@email.com", "test");

    const updatedCart = await updateDeliveryCartUseCase({
      weight: 4.2,
      deliveryMode: OrderDeliveryMode.MONDIAL_RELAY,
    });

    expect(updatedCart).toBeDefined();
    expect(updatedCart.weight).toBe(4.2);
    expect(updatedCart.prix).toBeGreaterThan(0);

    await authService.signOut();
  });
});
