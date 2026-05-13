import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCheckoutUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { CheckoutPresenter, DiscountType, PaymentMethod, ShopStatus } from "../../../../src/models";
import { getInjection } from "../../../../src/types/di";

describe('getCheckout', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should get a checkout', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const checkout : CheckoutPresenter = await getCheckoutUseCase(1);
        expect(checkout).toBeDefined();
        expect(checkout.id).toBe(1);
        expect(checkout.idClient).toBe(1);
        expect(checkout.idShop).toBe(1);
        expect(checkout.paymentMethod).toBe(PaymentMethod.CASH);
        expect(checkout.discountType).toBe(DiscountType.PERCENTAGE);
        expect(checkout.discountAmount).toBe('10');
        expect(checkout.totalHT).toBe('90');
        expect(checkout.totalTTC).toBe('108');
        expect(checkout.cbAmount).toBe('0');
        expect(checkout.cashAmount).toBe('108');
        expect(checkout.checkAmount).toBe('0');
        expect(checkout.NoVAT).toBe(false);
        expect(checkout.createdAt).toBeDefined();
        expect(checkout.lines).toBeDefined();
        expect(checkout.shop).toBeDefined();
        expect(checkout.shop.id).toBe(1);
        expect(checkout.shop.name).toBe('Shop 1');
        expect(checkout.shop.expirationDate).toBeDefined();
        expect(checkout.shop.isActive).toBe(true);
        expect(checkout.shop.status).toBe(ShopStatus.OPEN);
        expect(checkout.shop.department).toBe('1');
        expect(checkout.shop.createdAt).toBeDefined();
        expect(checkout.client).toBeDefined();
        expect(checkout.client.clientNumber).toBe(1);
        expect(checkout.client.email).toBe('user1@example.com');
        expect(checkout.client.firstName).toBe('User 1');
        expect(checkout.client.lastName).toBe('User 1');
        expect(checkout.lines).toBeDefined();
        expect(checkout.lines?.length).toBe(1);
        expect(checkout.lines?.[0]?.modelProduct).toBeDefined();
        expect(checkout.lines?.[0]?.modelProduct?.name).toBe('Model 1');
        expect(checkout.lines?.[0]?.modelProduct?.attributs).toBeDefined();
        expect(checkout.lines?.[0]?.modelProduct?.attributs?.length).toBe(2);
        expect(checkout.lines?.[0]?.modelProduct?.attributs?.[0]).toBe('Attribut 1');
        expect(checkout.lines?.[0]?.modelProduct?.attributs?.[1]).toBe('Attribut 2');
        expect(checkout.lines?.[0]?.modelProduct?.price).toBe(100);
        expect(checkout.lines?.[0]?.modelProduct?.image).toBe('https://via.placeholder.com/150');
    });
});