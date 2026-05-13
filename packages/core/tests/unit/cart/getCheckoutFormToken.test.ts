import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCheckoutFormTokenUseCase } from "@repo/core/usecases";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { setup, teardown } from "./_Setup";

describe("Get checkout form token", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should return a valid checkout form token for signed-in user", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("jean.dupont@email.com", "test");

    const formCheckout = await getCheckoutFormTokenUseCase();

    expect(formCheckout).toBeDefined();
    expect(formCheckout.token).toBeDefined();
    expect(formCheckout.pubKey).toBeDefined();

    await authService.signOut();
  });

  it("should throw UnauthorizedError if no user is signed in", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signOut();

    await expect(getCheckoutFormTokenUseCase()).rejects.toThrow(UnauthorizedError);
  });
});
