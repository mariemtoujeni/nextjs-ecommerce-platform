import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { addCustomization } from "../../../src/usecases/products/addCustomization";
import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";
import { getInjection } from "../../../src/types/di";
import { UnauthorizedError } from "../../../src/types/error";
import { setup, teardown } from "./_Setup";

describe('addCustomization', () => {

    beforeEach(setup);
    afterEach(teardown);

    it('should add a customization to a product', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        
        const customization = await addCustomization(1, {
            description: 'Customization 1',
            price: 100,
        });

        expect(customization).toBeDefined();
        expect(customization.id).toBe(2);
        expect(customization.description).toBe('Customization 1');
        expect(customization.price).toBe(100);

        await authService.signOut();
    });

    it('should not add a customization to a product if the user is not authenticated', async () => {
        await expect(addCustomization(1, {
            description: 'Customization 1',
            price: 100,
        })).rejects.toThrow(UnauthorizedError);
    });
});