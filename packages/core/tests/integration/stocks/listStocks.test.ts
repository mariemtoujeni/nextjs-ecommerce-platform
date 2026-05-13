import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listStocksUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";

describe("listStocks.test", () => {
    let supabase: SupabaseClient;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
    });

    it("should return the stocks with model", async () => {
        const stocks = await listStocksUseCase();
        expect(stocks.items?.length).toBeGreaterThan(0);
        expect(stocks.items?.[0]?.model?.name).toBeDefined();
        expect(stocks.items?.[0]?.model?.codeBar).toBeDefined();
        expect(stocks.items?.[0]?.model?.price).toBeDefined();
        expect(stocks.items?.[0]?.model?.attributs).toBeDefined();
    });
});