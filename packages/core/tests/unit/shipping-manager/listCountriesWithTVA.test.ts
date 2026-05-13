import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { listCountriesWithTVAUseCase } from '../../../src/usecases';

describe('ListCountriesWithTVAUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should list countries with TVA', async () => {
        const countries = await listCountriesWithTVAUseCase();
        expect(countries).toBeDefined();
        expect(countries.items.length).toBe(5);
        expect(countries.items[0]?.code).toBe('US');
        expect(countries.items[1]?.code).toBe('GB');
        expect(countries.items[2]?.code).toBe('CA');
        expect(countries.items[3]?.code).toBe('AU');
        expect(countries.items[4]?.code).toBe('JP');
    });
});