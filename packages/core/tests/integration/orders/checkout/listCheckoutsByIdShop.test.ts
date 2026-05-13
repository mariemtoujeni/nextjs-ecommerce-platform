import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listCheckoutsByIdShopUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { CheckoutStatus, DiscountType, PaymentMethod, Shop, ShopStatus } from "../../../../src/models";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../../src/types";
import { mapFromType } from "../../../../src/adapters/supabase/MapToType";
import { CheckoutKeyMap, ShopKeyMap } from "../../../../src/adapters/supabase";


describe('listCheckoutsByIdShop', () => {
    let checkoutId = 2147483646;
    let shopId = 2147483646;
    let supabase: SupabaseClient;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");

        const shop = {
            name: 'Test Shop',
            expirationDate: new Date(),
            isActive: true,
            status: ShopStatus.OPEN,
            department: '91',
            createdAt: new Date()
        }

        const { data : shopData, error : shopError } = await supabase.from("point_ventes").insert(mapFromType(shop, ShopKeyMap)).select("id").single();
        if (shopError) throw shopError;

        shopId = shopData.id;

        const checkout = {
            idClient: 34864,
            idShop: shopId,
            paymentMethod: 'ESPECE',
            discountType: 'POURCENTAGE',
            discountAmount: '10',
            totalHT: '100',
            totalTTC: '100',
            cbAmount: '100',
            cashAmount: '0',
            checkAmount: '0',
            NoVAT: true,
            status: CheckoutStatus.OPEN,
            createdAt: new Date()
        }

        const { data : checkoutData, error : checkoutError } = await supabase.from("caisses").insert(mapFromType(checkout, CheckoutKeyMap)).select().single();
        if (checkoutError) throw checkoutError;

        checkoutId = checkoutData.id;
    });

    afterAll(async () => {
        const { error : checkoutError } = await supabase.from("caisses").delete().eq("id", checkoutId);
        if (checkoutError) throw checkoutError;

        const { error : shopError } = await supabase.from("point_ventes").delete().eq("id", shopId);
        if (shopError) throw shopError;
    });

    it('should return all checkouts by shop id', async () => {
        const checkouts = await listCheckoutsByIdShopUseCase(shopId);
        expect(checkouts.total).toBe(1);
        expect(checkouts.count).toBe(1);
        expect(checkouts.items).toHaveLength(1);
        expect(checkouts.items?.[0]?.idShop).toBe(shopId);
    })
})