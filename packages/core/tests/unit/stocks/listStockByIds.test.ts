import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listStockByIdsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("listStockByIdsUseCase", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should return the stocks by ids", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const stocks = await listStockByIdsUseCase([1, 2, 3]);
        expect(stocks.items?.length).toBe(3);
        expect(stocks.items?.[0]?.idModel).toBe(1);
        expect(stocks.items?.[1]?.idModel).toBe(2);
        expect(stocks.items?.[2]?.idModel).toBe(3);
    });

    it("should throw an error if the stocks are not found", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(listStockByIdsUseCase([100, 200, 300])).rejects.toThrow("Stocks not found");
    });
});