import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllShopsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { ShopStatus } from "../../../../src/models";
import { getInjection } from "../../../../src/types/di";


describe("listAllShopsUseCase", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should return all shops", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const shops = await listAllShopsUseCase(false);
        expect(shops.items.length).toBe(6);
        expect(shops.items[0]?.id).toBe(6);
        expect(shops.items[0]?.name).toBe("Shop 6");
        expect(shops.items[0]?.status).toBe(ShopStatus.OPEN);
        expect(shops.items[0]?.department).toBe("6");
        expect(shops.items[0]?.expirationDate).toBeDefined();
        expect(shops.items[0]?.createdAt).toBeDefined();
    });
});