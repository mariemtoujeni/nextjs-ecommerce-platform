import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setup, teardown } from "./_Setup";

import { getInjection } from "@repo/core/types";
import { anonymizeClientDataUseCase } from "@repo/core/usecases";
import { SharedMemory } from "../../../../core/src/adapters/mock";

describe("ClientService - anonymizeClientData", () => {
    beforeEach(() => setup());
    afterEach(() => teardown());

    it("should anonymize an existing client", async () => {
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("jean.dupont@email.com", "test")

        const anonymizedClient = await anonymizeClientDataUseCase();


        expect(anonymizedClient.firstName).toBe("Anonyme");
        expect(anonymizedClient.lastName).toBe("Anonyme");
        expect(anonymizedClient.email).toBe("exemple@nataquashop.com");
        expect(anonymizedClient.phone).toBe("0000000000");
        expect(anonymizedClient.mobilePhone).toBe("0000000000");
        expect(anonymizedClient.workPhone).toBe("0000000000");
        const clientInMemory = SharedMemory.clients.find(c => c.userId === "1");
        expect(clientInMemory?.firstName).toBe("Anonyme");


    });


});