import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { updateTrancheUseCase } from '../../../src/usecases';

describe('updateTrancheUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);
   
    it('should update a tranche', async () => {
        const updatedTranche = await updateTrancheUseCase(
            {
                mode_livraison: 'SO_COLISSIMO', 
                zone: 'France', 
                poids_min: 1000, 
                poids_max: 2000,
                prix: 5.0
            },
            {
                mode_livraison: 'SO_COLISSIMO', 
                zone: 'France', 
                poids_min: 1000, 
                poids_max: 2000,
                prix: 10.5
            }
        );
        expect(updatedTranche).toBeDefined();
        expect(updatedTranche.mode_livraison).toBe('SO_COLISSIMO');
        expect(updatedTranche.zone).toBe('France');
        expect(updatedTranche.poids_min).toBe(1000);
        expect(updatedTranche.poids_max).toBe(2000);
        expect(updatedTranche.prix).toBe(10.5);
    });
});