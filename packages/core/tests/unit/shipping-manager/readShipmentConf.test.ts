import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { readShipmentConfUseCase } from '../../../src/usecases';

describe('readShipmentConfUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should read shipment configuration', async () => {
        const shipmentConf = await readShipmentConfUseCase('SO_COLISSIMO');
        expect(shipmentConf).toBeDefined();
        expect(shipmentConf.length).toBe(1);
        expect(shipmentConf[0]?.zone).toBe('France');
        expect(shipmentConf[0]?.tranches.length).toBe(2);
        expect(shipmentConf[0]?.tranches[0]?.poids_min).toBe(0);
        expect(shipmentConf[0]?.tranches[0]?.poids_max).toBe(1000);
        expect(shipmentConf[0]?.tranches[0]?.prix).toBe(5);
        expect(shipmentConf[0]?.tranches[1]?.poids_min).toBe(1000);
        expect(shipmentConf[0]?.tranches[1]?.poids_max).toBe(2000);
        expect(shipmentConf[0]?.tranches[1]?.prix).toBe(6);
        expect(shipmentConf[0]?.countries.length).toBe(3);
        expect(shipmentConf[0]?.countries[0]).toBe('France');
        expect(shipmentConf[0]?.countries[1]).toBe('Monaco');
        expect(shipmentConf[0]?.countries[2]).toBe('Andorre');
    });
});