import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createShopWhithShopLinesUseCase } from "../../../../src/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { BadRequestError, getInjection } from "../../../../src/types";
import { Department, ShopPresenterInput, ShopStatus } from "../../../../src/models";

describe("createShopWhithShopLinesUseCase", () => {
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

    it("should create a shop with shop lines", async () => {
        const shopToCreate : ShopPresenterInput = {
            name: "Test Shop",
            expirationDate: new Date().toISOString(),
            isActive: false,
            status: ShopStatus.DRAFT,
            department: Department.AVEYRON,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lines: [
                {
                    idModel: 42692,
                    idShop: 0,
                    initialQuantity: 10,
                    soldQuantity: 0,
                    finalQuantity: 10,
                    totalPriceTTC: 0
                }
            ]
        };

        const shop = await createShopWhithShopLinesUseCase(shopToCreate);
        shopId = shop.item.id;
        expect(shop.item).toBeDefined();
        expect(shop.item.id).toBeDefined();
        expect(shop.item.name).toBe("Test Shop");
        expect(shop.item.status).toBe(ShopStatus.DRAFT);
        expect(shop.item.department).toBe(Department.AVEYRON);

        expect(shop.item.lines.length).toBe(1);
        expect(shop.item.lines[0]?.idModel).toBe(42692);
        expect(shop.item.lines[0]?.idShop).toBe(shopId);
        expect(shop.item.lines[0]?.initialQuantity).toBe(10);
        expect(shop.item.lines[0]?.soldQuantity).toBe(0);
        expect(shop.item.lines[0]?.finalQuantity).toBe(10);
        expect(shop.item.lines[0]?.totalPriceTTC).toBe(0);
    });

    it("should not create a s shop with invalid shop information", async () => {
        const shopToCreate = {
            expirationDate: new Date().toISOString(),
            isActive: false,
            status: ShopStatus.DRAFT,
            department: Department.AVEYRON,
        } as ShopPresenterInput;

        await expect(createShopWhithShopLinesUseCase(shopToCreate)).rejects.toThrow(BadRequestError);
    });
});