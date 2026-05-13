import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { deleteCustomization } from "../../../src/usecases/products/deleteCustomization";
import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";
import { getInjection } from "../../../src/types/di";
import { UnauthorizedError } from "../../../src/types/error";
import { setup, teardown } from "./_Setup";

describe('deleteCustomization', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('should delete a customization', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await deleteCustomization(1);

        const customization = SharedMemory.productCustomizations.find(c => c.id === 1);
        expect(customization).toBeUndefined();

        await authService.signOut();    
    });

    it('should not delete a customization if the user is not authenticated', async () => {
        await expect(deleteCustomization(1)).rejects.toThrow(UnauthorizedError);
    });
});