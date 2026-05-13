import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteCheckoutUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { getInjection } from "../../../../src/types/di";

describe('deleteCheckout', () => {
    beforeEach(setup);

    afterEach(teardown);
    it('should delete a checkout', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const checkout = await deleteCheckoutUseCase(1);
        expect(checkout).toBeTruthy();
    });
});