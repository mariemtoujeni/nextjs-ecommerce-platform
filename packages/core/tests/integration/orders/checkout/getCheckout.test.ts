import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { getCheckoutUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Checkout, CheckoutLine, CheckoutPresenter, CheckoutStatus, DiscountType, PaymentMethod } from "../../../../src/models";
import { mapFromType } from "../../../../src/adapters/supabase/MapToType";
import { CheckoutKeyMap, CheckoutLineKeyMap } from "../../../../src/adapters/supabase";

describe('getCheckout', () => {
    const checkoutId = 2147483646;
    let supabase: SupabaseClient;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");

        const checkout = {
            id: checkoutId,
            idClient: 34864,
            idShop: 642,
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

        const checkoutLines : any[] = [
            {
                id: checkoutId,
                idModel: 717,
                name: "Test Model",
                codeBar: "1234567890",
                price: 100,
                quantity: 1,
                discount: '0',
                discountType: 'POURCENTAGE',
                VAT: 20,
                comment: "Test Comment",
                idCheckout: checkoutData.id
            }
        ]

        const { data : checkoutLinesData, error : checkoutLinesError } = await supabase.from("caisse_lignes").insert(checkoutLines.map(line => mapFromType(line, CheckoutLineKeyMap))).select();
        if (checkoutLinesError) throw checkoutLinesError;

        const { data : shopLinesData, error : shopLinesError } = await supabase.from("point_vente_lignes").update({
            stock_vendu: 1,
            stock_final: 9,
            prix_total_ttc: 100
        }).eq("id_point_vente", 642).eq("id_modele", 717);
        if (shopLinesError) throw shopLinesError;
    });

    afterAll(async () => {
        await supabase.from("caisse_lignes").delete().eq("id", checkoutId);
        await supabase.from("caisses").delete().eq("id", checkoutId);
        await supabase.from("point_vente_lignes").update({
            stock_initial: 10,
            stock_vendu: 0,
            stock_final: 10,
            prix_total_ttc: 0
        }).eq("id_point_vente", 642).eq("id_modele", 717);
    });

    it('should get a checkout', async () => {        
        const checkout : CheckoutPresenter = await getCheckoutUseCase(checkoutId);
        
        expect(checkout).toBeDefined();
        expect(checkout.id).toBe(checkoutId);
        expect(checkout.idClient).toBe(34864);
        expect(checkout.idShop).toBe(642);
        expect(checkout.paymentMethod).toBe(PaymentMethod.CASH);
        expect(checkout.discountType).toBe(DiscountType.PERCENTAGE);
        expect(parseFloat(checkout.discountAmount)).toBe(10);
        expect(parseFloat(checkout.totalHT)).toBe(100);
        expect(parseFloat(checkout.totalTTC)).toBe(100);
        expect(parseFloat(checkout.cbAmount)).toBe(100);
        expect(parseFloat(checkout.cashAmount)).toBe(0);
        expect(parseFloat(checkout.checkAmount)).toBe(0);
        expect(checkout.NoVAT).toBe(true);
        expect(checkout.status).toBe(CheckoutStatus.OPEN);
        expect(checkout.createdAt).toBeDefined();
        expect(checkout.lines).toBeDefined();
        expect(checkout.lines).toBeInstanceOf(Array);
        expect(checkout.lines?.length).toBe(1);
        expect(checkout.lines?.[0]?.id).toBe(checkoutId);
        expect(checkout.lines?.[0]?.idModel).toBe(717);
        expect(checkout.lines?.[0]?.name).toBe('Test Model');
        expect(checkout.lines?.[0]?.codeBar).toBe('1234567890');
        expect(checkout.lines?.[0]?.price).toBe(100);
        expect(checkout.lines?.[0]?.quantity).toBe(1);
        expect(checkout.lines?.[0]?.discount).toBe(0);
        expect(checkout.lines?.[0]?.discountType).toBe(DiscountType.PERCENTAGE);
        expect(checkout.lines?.[0]?.VAT).toBe(20);
        expect(checkout.lines?.[0]?.comment).toBe('Test Comment');
        expect(checkout.lines?.[0]?.idCheckout).toBe(checkoutId);
        
        expect(checkout.lines?.[0]?.modelProduct?.name).toBeDefined();
        expect(checkout.lines?.[0]?.modelProduct?.name).toBe("SAREDOX");
        expect(checkout.lines?.[0]?.modelProduct?.attributs?.length).toBe(2);
        expect(checkout.lines?.[0]?.modelProduct?.attributs?.includes("Bleu roi")).toBeTruthy();
        expect(checkout.lines?.[0]?.modelProduct?.attributs?.includes("75")).toBeTruthy();
        expect(checkout.shop).toBeDefined();
        expect(checkout.shop).toBeInstanceOf(Object);
        expect(checkout.shop.id).toBe(642);
        expect(checkout.client).toBeDefined();
        expect(checkout.client).toBeInstanceOf(Object);
        expect(checkout.client.clientNumber).toBe(34864);
    });
});