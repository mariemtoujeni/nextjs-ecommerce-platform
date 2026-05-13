import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createShopUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { Department, ShopStatus } from "../../../../src/models";
import { getInjection } from "../../../../src/types/di";

describe("createShopUseCase", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should create a shop", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const shop = await createShopUseCase({ 
            name: "Test Shop", 
            status: ShopStatus.DRAFT,
            expirationDate: new Date().toISOString(),
            isActive: true,
            department: Department.PARIS
        });
        expect(shop.name).toBe("Test Shop");
        expect(shop.status).toBe(ShopStatus.DRAFT);
        expect(shop.expirationDate).toBeDefined();
        expect(shop.isActive).toBe(true);
        expect(shop.department).toBe(Department.PARIS);
    });
});