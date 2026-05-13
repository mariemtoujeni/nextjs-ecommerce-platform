import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { listAttributesUseCase } from '../../../src/usecases';
import { getInjection } from "../../../src/types/di";

describe('listAttributesUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('should list attributes', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const attributes = await listAttributesUseCase();
        expect(attributes).toBeDefined();
        expect(attributes.length).toBe(3);
    });
});
