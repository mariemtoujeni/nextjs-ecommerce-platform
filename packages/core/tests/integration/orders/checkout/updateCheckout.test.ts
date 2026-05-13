import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { updateCheckoutUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { NotFoundError, getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { CheckoutStatus, ClientType, DiscountType, PaymentMethod } from "../../../../src/models";
import { mapFromType } from "../../../../src/adapters/supabase/MapToType";
import { CheckoutKeyMap } from "../../../../src/adapters/supabase";


describe('updateCheckout', () => {
    let checkoutId = 2147483646;
    let supabase: SupabaseClient;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");

        const checkout = {
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

        checkoutId = checkoutData.id;
    })

    afterAll(async () => {
        const { error : checkoutError } = await supabase.from("caisses").delete().eq("id", checkoutId);
        if (checkoutError) throw checkoutError;
    })

    it('should update a checkout', async () => {
        const checkout = await updateCheckoutUseCase(checkoutId, {
            idClient: 34864,
            idShop: 642,
            paymentMethod: PaymentMethod.CASH,
            discountType: DiscountType.PERCENTAGE,
            discountAmount: '10',
            totalHT: '100',
            totalTTC: '100',
            cbAmount: '100',
            cashAmount: '0',
            checkAmount: '0',
            NoVAT: true,
            status: CheckoutStatus.CLOSED,
        })

        expect(checkout.idClient).toBe(34864);
        expect(checkout.idShop).toBe(642);
        expect(checkout.paymentMethod).toBe(PaymentMethod.CASH);
        expect(checkout.discountType).toBe(DiscountType.PERCENTAGE);
        expect(checkout.discountAmount).toBe('10');
        expect(checkout.totalHT).toBe(100);
        expect(checkout.totalTTC).toBe(100);
        expect(checkout.cbAmount).toBe(100);
        expect(checkout.cashAmount).toBe(0);
        expect(checkout.checkAmount).toBe(0);
        expect(checkout.NoVAT).toBe(true);
        expect(checkout.status).toBe(CheckoutStatus.CLOSED);
    })

      it('should not update a checkout if the checkout is not found', async () => {
        await expect(updateCheckoutUseCase(0, {
            idClient: 34864,
            idShop: 642,
            paymentMethod: PaymentMethod.CASH,
            discountType: DiscountType.PERCENTAGE,
            discountAmount: '10',
            totalHT: '100',
            totalTTC: '100',
            cbAmount: '100',
            cashAmount: '0',
            checkAmount: '0',
            NoVAT: true,
            status: CheckoutStatus.CLOSED,
        })).rejects.toThrow(NotFoundError);
    })
})