import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { updateDescriptionUseCase } from "../../../src/usecases/products/updateDescription";
import { getInjection } from "../../../src/types/di";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, signOutTestUser, TestUser } from "../utils";
import { ProductDescriptionUpdate } from "../../../src/models/Product";

describe("updateDescription", () => {
    const productId = 4359;
    const oldData  = {}
    let supabase: SupabaseClient;
    const update: ProductDescriptionUpdate = {
        title: "test",
        lang: "fr",
        description: "test"
    }
    beforeAll(async () => {

        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClientAdmin");
        const { data: product } = await supabase.from("produit_descriptions").select("*").eq("id_produit", productId).eq("lang", "fr").single();
        Object.assign(oldData, product);
        
    })
    afterAll(async () => {
        await supabase.from("produit_descriptions").update(oldData).eq("id_produit", productId).eq("lang", "fr");
        await signOutTestUser();
    })

    it("should update the description of a product", async () => {
        await updateDescriptionUseCase(productId, update);
        const { data: product } = await supabase.from("produit_descriptions").select("*").eq("id_produit", productId).eq("lang", "fr").single();
        expect(product.titre).toBe(update.title);
        expect(product.lang).toBe(update.lang);
        expect(product.description).toBe(update.description); 
    })
})