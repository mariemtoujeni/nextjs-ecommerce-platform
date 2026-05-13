import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createShopUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";
import { Department, ShopStatus } from "../../../../src/models";

describe("createShopUseCase", () => {
    let supabase: SupabaseClient;
    let shopId: number;
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");
    });

    afterAll(async () => {
        const { error } = await supabase.from("point_vente_lignes").delete().eq("id_point_vente", shopId);
        if (error) {
            console.error("Error deleting shop lines -> delete shop line: ", error);
        }
        const { error: error2 } = await supabase.from("point_ventes").delete().eq("id", shopId);
        if (error2) {
            console.error("Error deleting shop -> delete shop: ", error2);
        }
    });

    it("should create a shop", async () => {
        const shop = await createShopUseCase({
            name: "Test Shop",
            status: ShopStatus.OPEN,
            department: Department.AVEYRON,
        });
        shopId = shop.id;
        expect(shop).toBeDefined();
        expect(shop.id).toBeDefined();
        expect(shop.name).toBe("Test Shop");
        expect(shop.status).toBe(ShopStatus.OPEN);
        expect(shop.department).toBe(Department.AVEYRON);
    });
});