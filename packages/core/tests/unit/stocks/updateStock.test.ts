import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getStockByIdUseCase, updateStockUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("updateStockUseCase", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should update the stock", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await updateStockUseCase([{
            idModel: 1,
            updatedAt: new Date().toISOString(),
            locked: 1,
            indisponible: 1,
            disponible: 1
        }]);

        const stock = await getStockByIdUseCase(1);
        expect(stock.item.locked).toBe(1);
        expect(stock.item.indisponible).toBe(1);
        expect(stock.item.disponible).toBe(1);
    });       
});