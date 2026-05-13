import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listCheckoutsByIdShopUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { getInjection } from "../../../../src/types/di";

describe('listCheckoutsByIdShop', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return all checkouts by shop id', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const checkouts = await listCheckoutsByIdShopUseCase(1);
        expect(checkouts.total).toBe(1);
        expect(checkouts.count).toBe(1);
        expect(checkouts.items).toHaveLength(1);
        expect(checkouts.items?.[0]?.idShop).toBe(1);        
    })

    it('should not return any checkout if shop id is not found', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(listCheckoutsByIdShopUseCase(100)).rejects.toThrow('Shop not found');
    })
})