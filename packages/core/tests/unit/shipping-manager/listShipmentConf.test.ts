import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { setup, teardown } from './_Setup';
import { listShipmentConfUseCase } from '../../../src/usecases';

describe('ListExpediteurZoneUseCase', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('Should list expediteur zones', async () => {
        const expediteurZones = await listShipmentConfUseCase();
        expect(expediteurZones).toBeDefined();
        expect(expediteurZones.length).toBe(2);
        expect(expediteurZones[0]?.mode_livraison).toBe('SO_COLISSIMO');
        expect(expediteurZones[1]?.mode_livraison).toBe('CHRONOPOST');
    });

    it('Should search by mode_livraison', async () => {
        const expediteurZones = await listShipmentConfUseCase({ mode_livraison: 'SO_COLISSIMO' });
        expect(expediteurZones).toBeDefined();
        expect(expediteurZones.length).toBe(1);
        expect(expediteurZones[0]?.mode_livraison).toBe('SO_COLISSIMO');
    });

    it('Should search by zone', async () => {
        const expediteurZones = await listShipmentConfUseCase({ zone: 'Italie' });
        expect(expediteurZones).toBeDefined();
        expect(expediteurZones.length).toBe(1);
        expect(expediteurZones[0]?.zone).toContain('Italie');
    });

    it('Should return all expiditeurs if no mode_livraison and no zone are defined', async () => {
        const expediteurZones = await listShipmentConfUseCase({});
        expect(expediteurZones).toBeDefined();
        expect(expediteurZones.length).toBe(2);
    });
});

