import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listClientAddressesUseCase } from "@repo/core/usecases";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { setup, teardown } from "./_Setup";

describe("List client addresses", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should return client addresses for signed-in user", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("marie.martin@email.com", "test"); 

    const addresses = await listClientAddressesUseCase();

    expect(addresses).toBeDefined();
    expect(addresses.length).toBeGreaterThan(0);

    expect(addresses[0]).toMatchObject({
      id: 1,
      numero_client: 785,
      nom: "Martin",
      prenom: "Marie",
      adresse: "123 Rue de la République",
      ville: "Paris",
      pays: "FR",
    });

    await authService.signOut();
  });

  it("should throw UnauthorizedError if no user is signed in", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signOut();

    await expect(listClientAddressesUseCase()).rejects.toThrow(UnauthorizedError);
  });
});
