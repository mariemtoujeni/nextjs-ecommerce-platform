import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { deleteCountryFromZoneUseCase } from '../../../src/usecases';

describe('DeleteCountryFromZoneUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);
   
    it('Should delete country from zone', async () => {
        const countries = await deleteCountryFromZoneUseCase("France", "France", "SO_COLISSIMO");
        expect(countries).toBeDefined();
        expect(countries.length).toBe(8);        
    });
});