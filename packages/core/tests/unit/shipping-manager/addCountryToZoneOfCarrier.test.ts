import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { deleteCountryFromZoneUseCase, addCountryToZoneOfCarrierUseCase } from '../../../src/usecases';

describe('AddCountryToZoneOfCarrierUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);
   
    it('should add a country to a zone of a carrier', async () => {
        const countriesAfterDelete = await deleteCountryFromZoneUseCase("France", "France", "SO_COLISSIMO");
        expect(countriesAfterDelete).toBeDefined();
        expect(countriesAfterDelete.length).toBe(8);     
        
        

        const countries = await addCountryToZoneOfCarrierUseCase('France', 'France', 'SO_COLISSIMO');
        expect(countries).toBeDefined();
        expect(countries.length).toBe(9);
    });
});