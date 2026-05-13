import { expect, describe, it } from "vitest";
import { listCountriesWithTVAUseCase } from '../../../src/usecases';
import { signInTestUser, TestUser } from "../utils";

describe('listCountriesWithTVA', () => {
    it('should return countries with TVA', async () => {
        await signInTestUser(TestUser.ADMIN);

        const countries = await listCountriesWithTVAUseCase();
        expect(countries).toBeDefined();
        expect(countries.items.length).toBeGreaterThan(217);
    });
});