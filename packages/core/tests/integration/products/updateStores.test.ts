import { SupabaseClient } from "@supabase/supabase-js";
import { describe, it, expect,  beforeAll, afterAll } from "vitest";
import { signInTestUser, signOutTestUser, TestUser } from "../utils";
import { getInjection } from "../../../src/types/di";
import { updateStoresUseCase } from "../../../src/usecases/products/updateStores";


describe("updateStores", () => {
    const productId = 4359;
    const oldData: any[]  = []
    let supabase: SupabaseClient;
    const update = [1, 5];

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClientAdmin");
        const { data: product } = await supabase.from("produit_magasins").select("*").eq("id_produit", productId);
        Object.assign(oldData, product);
    })

    afterAll(async () => {
        await supabase.from("produit_magasins").delete().eq("id_produit", productId);
        await supabase.from("produit_magasins").insert(oldData);
        await signOutTestUser();
    })

    it("should update the stores of a product", async () => {
        await updateStoresUseCase(productId, update);
        const { data } = await supabase.from("produit_magasins").select("*").eq("id_produit", productId);
        expect(data?.length).toBe(update.length);
        expect(data?.map(p => p.id_magasin)).toEqual(update);
    })
})