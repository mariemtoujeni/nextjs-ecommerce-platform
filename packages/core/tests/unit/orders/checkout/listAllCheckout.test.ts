import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllCheckoutsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { getInjection } from "../../../../src/types/di";

describe('listAllCheckouts', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return all checkouts', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const checkouts = await listAllCheckoutsUseCase();
        expect(checkouts.total).toBe(6);
        expect(checkouts.count).toBe(6);
        expect(checkouts.items).toHaveLength(6);
    })
});