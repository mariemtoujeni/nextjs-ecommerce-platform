import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { readAttributeUseCase } from '../../../src/usecases';
import { getInjection } from "../../../src/types/di";

describe('readAttributeUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('should read attribute detail', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const attribute = await readAttributeUseCase(1);
        expect(attribute).toBeDefined();
        expect(attribute.id).toBe(1);
        expect(attribute.name).toBe('Couleur');
        expect(attribute.legend).toBe('Couleur du produit');
        expect(attribute.filters.length).toBe(2);
        expect(attribute.filters[0]?.id).toBe(1);
        expect(attribute.filters[0]?.nom).toBe('Rouge');
        expect(attribute.filters[0]?.couleur).toBe('#FF0000');
        expect(attribute.filters[1]?.id).toBe(2);
        expect(attribute.filters[1]?.nom).toBe('Bleu');
        expect(attribute.filters[1]?.couleur).toBe('#0000FF');
        expect(attribute.values.length).toBe(2);
        expect(attribute.values[0]?.id).toBe(1);
        expect(attribute.values[0]?.nom).toBe('Rouge');
        expect(attribute.values[1]?.id).toBe(2);
        expect(attribute.values[1]?.nom).toBe('Bleu');
    });
});