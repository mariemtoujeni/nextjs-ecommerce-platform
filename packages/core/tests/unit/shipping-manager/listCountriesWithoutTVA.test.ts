import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { listCountriesWithoutTVAUseCase } from '../../../src/usecases';

describe('ListCountriesWithoutTVAUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should list countries without TVA', async () => {
        const countries = await listCountriesWithoutTVAUseCase();
        expect(countries).toBeDefined();
        expect(countries.items.length).toBe(5);
        expect(countries.items[0]?.code).toBe('FR');
        expect(countries.items[1]?.code).toBe('BE');
        expect(countries.items[2]?.code).toBe('DE');
        expect(countries.items[3]?.code).toBe('IT');
        expect(countries.items[4]?.code).toBe('ES');
    });
});