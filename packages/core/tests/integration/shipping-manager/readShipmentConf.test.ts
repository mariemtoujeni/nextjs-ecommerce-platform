import { expect, describe, it } from "vitest";
import { readShipmentConfUseCase } from '../../../src/usecases';
import { signInTestUser, TestUser } from "../utils";
import { Shipment } from "@repo/core/models";

describe('readShipmentConf', () => {
    it('should return countries with TVA', async () => {
        await signInTestUser(TestUser.ADMIN);

        const shipmentConf = await readShipmentConfUseCase("SO_COLISSIMO");
        expect(shipmentConf).toBeDefined();
        expect(shipmentConf.length).toBe(6);
        const conf = shipmentConf[0] as Shipment;
        expect(conf.zone).toBe('France');
        expect(conf.tranches.length).toBe(9);
        expect(conf.tranches[0]?.poids_min).toBe(0);
        expect(conf.tranches[0]?.poids_max).toBe(250);
        expect(conf.tranches[0]?.prix).toBe(7.49);
        expect(conf.tranches[1]?.poids_min).toBe(250);
        expect(conf.tranches[1]?.poids_max).toBe(500);
        expect(conf.tranches[1]?.prix).toBe(8.39);
        expect(conf.tranches[2]?.poids_min).toBe(500);
        expect(conf.tranches[2]?.poids_max).toBe(750);
        expect(conf.tranches[2]?.prix).toBe(9.32);
        expect(conf.tranches[3]?.poids_min).toBe(750);
        expect(conf.tranches[3]?.poids_max).toBe(1000);
        expect(conf.tranches[3]?.prix).toBe(10.12);  
        expect(conf.tranches[4]?.poids_min).toBe(1000);
        expect(conf.tranches[4]?.poids_max).toBe(2000);
        expect(conf.tranches[4]?.prix).toBe(11.17);
        expect(conf.tranches[5]?.poids_min).toBe(2000);
        expect(conf.tranches[5]?.poids_max).toBe(5000);
        expect(conf.tranches[5]?.prix).toBe(17.16);
        expect(conf.tranches[6]?.poids_min).toBe(5000);
        expect(conf.tranches[6]?.poids_max).toBe(10000);
        expect(conf.tranches[6]?.prix).toBe(24.97);
        expect(conf.tranches[7]?.poids_min).toBe(10000);
        expect(conf.tranches[7]?.poids_max).toBe(15000);
        expect(conf.tranches[7]?.prix).toBe(31.57);
        expect(conf.tranches[8]?.poids_min).toBe(15000);
        expect(conf.tranches[8]?.poids_max).toBe(30000);
        expect(conf.tranches[8]?.prix).toBe(39.11);        
        expect(conf.countries.length).toBe(3);
        expect(conf.countries[0]).toBe('France');
        expect(conf.countries[1]).toBe('Monaco');
        expect(conf.countries[2]).toBe('Andorre');
    });
}) 