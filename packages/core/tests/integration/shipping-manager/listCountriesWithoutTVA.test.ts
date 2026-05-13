import { expect, describe, it } from "vitest";
import { listCountriesWithoutTVAUseCase } from '../../../src/usecases';
import { signInTestUser, TestUser } from "../utils";

describe('listCountriesWithoutTVA', () => {
    it('should return countries without TVA', async () => {
        await signInTestUser(TestUser.ADMIN);

        const countries = await listCountriesWithoutTVAUseCase();
        expect(countries).toBeDefined();
        expect(countries.items.length).toBeGreaterThan(5);
    });
});