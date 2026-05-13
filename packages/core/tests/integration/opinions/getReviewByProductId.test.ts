import { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "../../../src/types";

import { readOpinionByProductIdUseCase } from "../../../src/usecases/opinions/readOpinionByProductId";

describe("getReviewByProductId.test", () => {
    let supabase: SupabaseClient;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });
    afterAll(async () => {
    });
    it("should return reviews for a product", async () => {
        const review = await readOpinionByProductIdUseCase(1);
        expect(review).toBeDefined();
       
    });
    // it("should throw an error if the review is not found", async () => {
    //     expect(readOpinionByProductIdUseCase(99999)).rejects.toThrow("review not found");
    // });
});