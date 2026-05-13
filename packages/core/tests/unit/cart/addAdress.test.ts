import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addAddressUseCase } from "@repo/core/usecases";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { setup, teardown } from "./_Setup";
import { AddressFormInput } from "../../../src/models";

describe("Add client address", () => {
    beforeEach(setup);
    afterEach(teardown);
    const addressToAdd: AddressFormInput = {
      designation: "",
      address: "123 Rue de la République",
      complement: "Apt 45B",
      building: "Building A",
      postalCode: "75001",
      city: "Paris",
      country: "France"
    };
    it("should add an address to client address list", async () => {
        const authService = await getInjection("IAuthenticationService");
        
        await authService.signIn("jean.dupont@email.com", "test");

        const addedAddress = await addAddressUseCase(addressToAdd);
        expect(addedAddress).toBeDefined();
        expect(addedAddress.adresse).toBe("123 Rue de la République");
        expect(addedAddress.code_postal).toBe("75001");
        expect(addedAddress.pays).toBe("France");
        expect(addedAddress.ville).toBe("Paris");
        expect(addedAddress.adresse2).toBe("Apt 45B");
        expect(addedAddress.adresse3).toBe("Building A");
        
        await authService.signOut();
    });

    it("should throw UnauthorizedError if no user is signed in", async () => {
        await expect(addAddressUseCase(addressToAdd)).rejects.toThrow(UnauthorizedError);
    });


});
