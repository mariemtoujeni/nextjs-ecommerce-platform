import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getInjection } from "../../../src/types/di";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, signOutTestUser, TestUser } from "../utils";
import { deleteCustomization } from "../../../src/usecases/products/deleteCustomization";

describe("deleteCustomization", () => {
    let id: number = 0;
    let supabase: SupabaseClient;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClientAdmin");
        const { data } = await supabase.from("produit_personnalisations").insert({
            description: "test",
            prix: 100,
            id_produit: 4359,
        }).select().single();
        id = data.id;
    });

    afterAll(async () => {
        if(0 !== id) {
            await supabase.from("produit_personnalisations").delete().eq("id", id);
        }
        await signOutTestUser();
    });

    it("should delete a customization", async () => {
        await deleteCustomization(id);
        const { data } = await supabase.from("produit_personnalisations").select("*").eq("id", id).single();
        expect(data).toBeNull();
    });
});