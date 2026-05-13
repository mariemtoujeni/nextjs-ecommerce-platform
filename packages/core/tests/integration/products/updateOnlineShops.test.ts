import { describe, it, expect,  beforeAll, afterAll } from "vitest";
import { signInTestUser, signOutTestUser, TestUser } from "../utils";
import { getInjection } from "../../../src/types/di";
import { updateOnlineShops } from "../../../src/usecases/products/updateOnlineShops";
import { OnlineShop } from "../../../src/models/Product";
import { SupabaseClient } from "@supabase/supabase-js";


describe("updateOnlineShops", () => {
    const productId = 4359;
    const oldData: any[]  = []
    let supabase: SupabaseClient;
    const update = [OnlineShop.CRAZYSWIM, OnlineShop.SWIMWEAR_DESTOCK];

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClientAdmin");
        const { data } = await supabase.from("produit_boutiques").select("*").eq("id_produit", productId);
        Object.assign(oldData, data);
    })

    afterAll(async () => {
        await supabase.from("produit_boutiques").delete().eq("id_produit", productId);
        await supabase.from("produit_boutiques").insert(oldData);
        await signOutTestUser();
    })

    it("should update the online shops of a product", async () => {
        await updateOnlineShops(productId, update);
        const { data } = await supabase.from("produit_boutiques").select("*").eq("id_produit", productId);
        expect(data?.length).toBe(update.length);

        for(const shop of data ?? []) {
            expect(update.includes(shop.boutique)).toBe(true);
        }
    })
})