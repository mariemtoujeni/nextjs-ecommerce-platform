import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listStockByIdsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";

describe("listStockByIds.test", () => {
    let supabase: SupabaseClient;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
    });

    it("should return the stocks by ids", async () => {
        const stocks = await listStockByIdsUseCase([717, 718, 720]);
        expect(stocks.items?.length).toBe(3);
        expect(stocks.items?.[0]?.idModel).toBe(717);
        expect(stocks.items?.[1]?.idModel).toBe(718);
        expect(stocks.items?.[2]?.idModel).toBe(720);
    });
});