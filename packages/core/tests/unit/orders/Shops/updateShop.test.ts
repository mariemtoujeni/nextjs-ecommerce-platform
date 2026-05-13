import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateShopUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { ShopStatus } from "../../../../src/models";
import { getInjection } from "../../../../src/types/di";

describe("updateShopUseCase", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should update a shop", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const shop = await updateShopUseCase(6, { name: "Test Shop Updated 6", status: ShopStatus.CLOSED });
        expect(shop.name).toBe("Test Shop Updated 6");
        expect(shop.status).toBe(ShopStatus.CLOSED);
    });
    
});