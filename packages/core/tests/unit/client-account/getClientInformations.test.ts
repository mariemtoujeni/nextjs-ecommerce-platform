import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getClientInformationsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection, NotFoundError } from "@repo/core/types";

describe('getClientInformations', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return client informations', async () => {
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("jean.dupont@email.com", "test")
        const client = await getClientInformationsUseCase();
        expect(client.userId).toBe("1");
        expect(client.email).toBe("jean.dupont@email.com");
        expect(client.firstName).toBe("Jean");
        expect(client.lastName).toBe("Dupont");
        expect(client.phone).toBe("0123456789");
        expect(client.mobilePhone).toBe("0612345678");
        expect(client.workPhone).toBe("0123456789");
    })

    it('should trow if client does not exist', async () => {
        const authService = await getInjection('IAuthenticationService');
        await authService.signIn("jean.dupuy@email.com", "test")
        await expect(getClientInformationsUseCase()).rejects.toThrow(NotFoundError);
    })
})