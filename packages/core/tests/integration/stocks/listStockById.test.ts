import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getStockByIdUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError, getInjection } from "../../../src/types";

describe("listStockById.test", () => {
    let supabase: SupabaseClient;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
    });

    it("should return the stock by id", async () => {
        const stock = await getStockByIdUseCase(717);
        expect(stock.item.idModel).toBe(717);
        expect(stock.item.locked).toBeGreaterThanOrEqual(0);
        expect(stock.item.indisponible).toBeGreaterThanOrEqual(0);
        expect(stock.item.disponible).toBeGreaterThanOrEqual(0);
    });

    it("should throw an error if the stock is not found", async () => {
        await expect(getStockByIdUseCase(719)).rejects.toThrow(NotFoundError);
    });
});
