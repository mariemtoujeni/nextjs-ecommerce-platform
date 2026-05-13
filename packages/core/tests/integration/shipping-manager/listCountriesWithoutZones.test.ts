import { expect, describe, it } from "vitest";
import { listCountriesWithoutZonesUseCase } from '../../../src/usecases';
import { signInTestUser, TestUser } from "../utils";

describe('listCountriesWithoutZones', () => {
    it('should return countries without zones', async () => {
        await signInTestUser(TestUser.ADMIN);

        const countries = await listCountriesWithoutZonesUseCase();
        expect(countries).toBeDefined();
        expect(countries.length).toBe(0);
    });
});