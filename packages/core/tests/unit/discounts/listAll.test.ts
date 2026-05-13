import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllDiscountsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe('listAllDiscounts', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return all discounts', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        const discounts = await listAllDiscountsUseCase();
        expect(discounts.total).toBe(10);
        expect(discounts.count).toBe(10);
        expect(discounts.items).toHaveLength(10);
    })

    it('Should return only the last 2 discounts', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        const discounts = await listAllDiscountsUseCase({
            limit: 2,
            offset: 0,
        });
        expect(discounts.total).toBe(10);
        expect(discounts.count).toBe(2);
        expect(discounts.items).toHaveLength(2);

        expect(discounts.items[0]?.id).toBeGreaterThan(discounts.items[1]?.id as number);
    })

    it('Should return only the first 2 discounts', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        const discounts = await listAllDiscountsUseCase({
            limit: 2,
            offset: 0,
            sort: "asc",
        });
        expect(discounts.total).toBe(10);
        expect(discounts.count).toBe(2);
        expect(discounts.items).toHaveLength(2);

        expect(discounts.items[0]?.id).toBeLessThan(discounts.items[1]?.id as number);
    })

    it('Should return only the 2 discounts at position 3 and 4', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        const discounts = await listAllDiscountsUseCase({
            limit: 2,
            offset: 2,
            sort: "asc",
        });
        expect(discounts.total).toBe(10);
        expect(discounts.count).toBe(2);
        expect(discounts.items).toHaveLength(2);

        expect(discounts.items[0]?.id).toBe(3);
        expect(discounts.items[1]?.id).toBe(4);
    })
})