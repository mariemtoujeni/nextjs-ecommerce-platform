import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getShopUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { ShopStatus } from "../../../../src/models";
import { getInjection } from "../../../../src/types/di";

describe("getShopUseCase", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should return a shop", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const shop = await getShopUseCase(6);
        expect(shop.id).toBe(6);
        expect(shop.name).toBe("Shop 6");
        expect(shop.status).toBe(ShopStatus.OPEN);
        expect(shop.department).toBe("6");
        expect(shop.expirationDate).toBeDefined();
        expect(shop.createdAt).toBeDefined();
    });
});
