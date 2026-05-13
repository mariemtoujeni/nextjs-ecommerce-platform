import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { deleteTrancheUseCase, readShipmentConfUseCase } from '../../../src/usecases';

describe('DeleteTrancheFromZoneUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should delete tranche from zone', async () => {
        await deleteTrancheUseCase({
            mode_livraison: "SO_COLISSIMO",
            zone: "France",
            poids_min: 0,
            poids_max: 1000,
            prix: 0
        });
        const shipmentConf = await readShipmentConfUseCase('SO_COLISSIMO');
        expect(shipmentConf).toBeDefined();
        expect(shipmentConf.length).toBe(1);
        expect(shipmentConf[0]?.zone).toBe('France');
        expect(shipmentConf[0]?.tranches.length).toBe(1);
        expect(shipmentConf[0]?.tranches[0]?.poids_min).toBe(1000);
        expect(shipmentConf[0]?.tranches[0]?.poids_max).toBe(2000);
        expect(shipmentConf[0]?.tranches[0]?.prix).toBe(6);
    });
});