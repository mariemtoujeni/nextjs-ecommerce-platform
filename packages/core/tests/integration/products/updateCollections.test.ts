import { SupabaseClient } from "@supabase/supabase-js";
import { describe, it, expect,  beforeAll, afterAll } from "vitest";
import { signInTestUser, signOutTestUser, TestUser } from "../utils";
import { getInjection } from "../../../src/types/di";
import { updateCollections } from "../../../src/usecases/products/updateCollections";


describe("updateCollections", () => {
    const productId = 4359;
    const oldData: any[]  = []
    let supabase: SupabaseClient;
    const update = [2, 3];

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClientAdmin");
        const { data } = await supabase.from("collection_produits").select("*").eq("id_produit", productId);
        Object.assign(oldData, data);
    })

    afterAll(async () => {
        await supabase.from("collection_produits").delete().eq("id_produit", productId);
        await supabase.from("collection_produits").insert(oldData);
        await signOutTestUser();
    })

    it("should update the collections of a product", async () => {
        await updateCollections(productId, update);
        const { data } = await supabase.from("collection_produits").select("*").eq("id_produit", productId);
        expect(data?.length).toBe(update.length);
        expect(data?.map(p => p.id_collection)).toEqual(update);
    })
})