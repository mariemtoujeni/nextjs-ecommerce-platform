import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { updateCustomization } from "../../../src/usecases/products/updateCustomization";
import { getInjection } from "../../../src/types/di";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, signOutTestUser, TestUser } from "../utils";
import { Customization } from "../../../src/models/Product";

describe("updateCustomization", () => {
    let id: number = 0;
    let supabase: SupabaseClient;
    const update: Customization = {
        id: 0,
        description: "Super description",
        price: 1000,
    }

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

    it("should update a customization", async () => {
        await updateCustomization(id, update);
        const { data } = await supabase.from("produit_personnalisations").select("*").eq("id", id).single();
        expect(data?.description).toEqual(update.description);
        expect(data?.prix).toEqual(update.price);
    });
});