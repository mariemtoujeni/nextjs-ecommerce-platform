import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { listCountriesWithoutZonesUseCase } from '../../../src/usecases';

describe('ListCountriesWithoutZonesUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should list countries without zones', async () => {
        const countries = await listCountriesWithoutZonesUseCase();
        expect(countries).toBeDefined();
        expect(countries.length).toBe(8);        
    });
});