import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { updateCustomization } from "../../../src/usecases/products/updateCustomization";
import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";
import { getInjection } from "../../../src/types/di";
import { UnauthorizedError } from "../../../src/types/error";
import { setup, teardown } from "./_Setup";

describe('updateCustomization', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('should update a customization', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await updateCustomization(1, {
            description: 'Customization 2',
            price: 200,
        });

        const customization = SharedMemory.productCustomizations.find(c => c.id === 1);
        expect(customization).toBeDefined();
        expect(customization?.description).toBe('Customization 2');
        expect(customization?.price).toBe(200);

        await authService.signOut();
    });

    it('should not update a customization if the user is not authenticated', async () => {
        await expect(updateCustomization(1, {
            description: 'Customization 2',
            price: 200,
        })).rejects.toThrow(UnauthorizedError);
    });
});