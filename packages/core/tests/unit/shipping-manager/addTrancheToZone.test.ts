import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { addTrancheUseCase, readShipmentConfUseCase } from '../../../src/usecases';

describe('addTrancheToZoneUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);
   
    it('should add a tranche to a zone', async () => {
        const shipmentConfListInit = await readShipmentConfUseCase('SO_COLISSIMO');
        expect(shipmentConfListInit).toBeDefined();
        expect(shipmentConfListInit[0]?.tranches.length).toBe(2);

        const shipmentConf = await addTrancheUseCase({
            mode_livraison: 'SO_COLISSIMO', 
            zone: 'France', 
            poids_min: 2000, 
            poids_max: 3000, 
            prix: 10.5
        });
        expect(shipmentConf).toBeDefined();
        expect(shipmentConf.mode_livraison).toBe('SO_COLISSIMO');
        expect(shipmentConf.zone).toBe('France');
        expect(shipmentConf.poids_min).toBe(2000);
        expect(shipmentConf.poids_max).toBe(3000);
        expect(shipmentConf.prix).toBe(10.5);

        const shipmentConfList = await readShipmentConfUseCase('SO_COLISSIMO');
        expect(shipmentConfList).toBeDefined();
        expect(shipmentConfList[0]?.tranches.length).toBe(3);        
    });
});