import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createShopLineUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { getInjection } from "../../../../src/types/di";

describe("createShopLineUseCase", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should create a shop line", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const shopLine = await createShopLineUseCase([{ idModel: 2, idShop: 1, initialQuantity: 10, soldQuantity: 0, finalQuantity: 10, totalPriceTTC: 100 }]);
        expect(shopLine[0]?.idModel).toBe(2);
        expect(shopLine[0]?.idShop).toBe(1);
        expect(shopLine[0]?.initialQuantity).toBe(10);
        expect(shopLine[0]?.soldQuantity).toBe(0);
        expect(shopLine[0]?.finalQuantity).toBe(10);
        expect(shopLine[0]?.totalPriceTTC).toBe(100);
    });
});