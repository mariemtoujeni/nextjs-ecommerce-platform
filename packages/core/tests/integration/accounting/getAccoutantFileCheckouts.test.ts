import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { exportAccountingCheckoutsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";


describe("getAccoutantFileCheckouts.test", () => {
    let supabase: SupabaseClient;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
    });

    it("should export the accountant file", async () => {
        const url = await exportAccountingCheckoutsUseCase(new Date("2023-05-31").toISOString(), new Date("2023-06-01").toISOString());
        console.log("BORDEAUX DE VENTE CAISSE: ", url);
        expect(url).toBeDefined();
    });
});