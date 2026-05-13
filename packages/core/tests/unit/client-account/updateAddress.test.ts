import { SharedMemory } from "@repo/core/adapters/mock";
import { updateAddressUseCase } from "@repo/core/usecases";
import { getInjection } from "@repo/core/types";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setup, teardown } from "./_Setup";

describe("updateAddressUseCase", () => {
  beforeEach(async () => {
    await setup();
  });

  afterEach(async () => {
    await teardown();
  });

  it("should update address", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("jean.dupont@email.com", "test");

    const updated = {
      id: 1,
      default: true,
      address: "testaddress",
      postalCode: "testaddress",
      city: "testaddress",
      designation: "testaddress",
      country: "testaddress",

    };

    const address = await updateAddressUseCase(updated);

    expect(address.id).toBe(1);
    expect(address.default).toBe(true);
  });
}); 