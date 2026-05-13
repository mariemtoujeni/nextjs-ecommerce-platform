import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { addCustomization } from "../../../src/usecases/products/addCustomization";
import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";
import { getInjection } from "../../../src/types/di";
import { UnauthorizedError } from "../../../src/types/error";
import { TestUser, signInTestUser, signOutTestUser } from "../utils";

describe('addCustomization', () => {
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
    });
    afterAll(async () => {
        await signOutTestUser();
    });

    it('should add a customization to a product', async () => {
        const customization = await addCustomization(1, {
            description: 'Customization 1',
            price: 100,
        });

        expect(customization).toBeDefined();
        expect(customization.id).toBeGreaterThan(1);
        expect(customization.description).toBe('Customization 1');
        expect(customization.price).toBe(100);
    });
});