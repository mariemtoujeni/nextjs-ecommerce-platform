import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getStockByIdUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("listStockByIdUseCase", () => {
    beforeEach(async () => {
        await setup();
    });
   
    afterEach(async () => {
        await teardown();
    });

    it("should return the stock by id", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const stock = await getStockByIdUseCase(1);
        expect(stock.item.idModel).toBe(1);
        expect(stock.item.locked).toBe(1);
        expect(stock.item.indisponible).toBe(0);
        expect(stock.item.disponible).toBe(9);
    });

    it("should throw an error if the stock is not found", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(getStockByIdUseCase(100)).rejects.toThrow("Stock not found");
    });
});