import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateCheckoutUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { CheckoutStatus, DiscountType, PaymentMethod } from "../../../../src/models";
import { getInjection } from "../../../../src/types/di";

describe('updateCheckout', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should update a checkout', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const checkout = await updateCheckoutUseCase(1, {
            idClient: 1,
            idShop: 1,
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

        expect(checkout.idClient).toBe(1);
        expect(checkout.idShop).toBe(1);
        expect(checkout.paymentMethod).toBe(PaymentMethod.CASH);
        expect(checkout.discountType).toBe(DiscountType.PERCENTAGE);
        expect(checkout.discountAmount).toBe('10');
        expect(checkout.totalHT).toBe('100');
        expect(checkout.totalTTC).toBe('100');
        expect(checkout.cbAmount).toBe('100');
        expect(checkout.cashAmount).toBe('0');
        expect(checkout.checkAmount).toBe('0');
        expect(checkout.NoVAT).toBe(true);
        expect(checkout.status).toBe(CheckoutStatus.CLOSED);
    })

    it('should not update a checkout if the checkout is not found', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(updateCheckoutUseCase(100, {
            idClient: 1,
            idShop: 1,
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
        })).rejects.toThrow('Checkout not found');
    })
})