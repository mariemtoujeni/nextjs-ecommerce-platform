import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { createCodeCountriesWithoutTVAUseCase, listCountriesWithoutTVAUseCase } from '../../../src/usecases';

describe('CreateCountriesCodeUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should create countries code', async () => {
        const countries_init = await listCountriesWithoutTVAUseCase();
        expect(countries_init).toBeDefined();
        expect(countries_init.items.length).toBe(5);
        
        await createCodeCountriesWithoutTVAUseCase('JP');
        const countries = await listCountriesWithoutTVAUseCase();
        expect(countries).toBeDefined();
        expect(countries.items.length).toBe(6);
        expect(countries.items[0]?.code).toBe('FR');
        expect(countries.items[1]?.code).toBe('BE');
        expect(countries.items[2]?.code).toBe('DE');
        expect(countries.items[3]?.code).toBe('IT');
        expect(countries.items[4]?.code).toBe('ES');
        expect(countries.items[5]?.code).toBe('JP');
    });
});

