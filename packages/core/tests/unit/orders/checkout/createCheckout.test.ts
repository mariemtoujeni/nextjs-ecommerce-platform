import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createCheckoutUseCase } from "@repo/core/usecases";
import { setup, teardown } from "../_Setup";
import { CheckoutStatus, ClientType, DiscountType, PaymentMethod, ShopStatus } from "../../../../src/models";
import { getInjection } from "../../../../src/types/di";

describe('createCheckout', () => {
    beforeEach(setup);

    afterEach(teardown);
    it('should create a checkout', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const checkout = await createCheckoutUseCase({
            idClient: 1,
            idShop: 1,
            paymentMethod: PaymentMethod.CASH,
            discountType: DiscountType.PERCENTAGE,
            discountAmount: '10',
            totalHT: '100',
            totalTTC: '120',
            cbAmount: '10',
            checkAmount: '10',
            cashAmount: '10',
            NoVAT: false,
            status: CheckoutStatus.OPEN,
            lines: [],
            shop: {
                id: 1,
                name: 'Shop 1',
                expirationDate: new Date(),
                isActive: true,
                status: ShopStatus.OPEN,
                department: "1",
                createdAt: new Date(),
            },
            client: {
                userId: '1',
                email: 'user1@example.com',
                firstName: 'User 1',
                lastName: 'User 1',
                phone: "",
                mobilePhone: "",
                workPhone: "",
                clubMemberId: 0,
                clubId: 0,
                club: {
                    id: 0,
                    name: "",
                    president: "",
                    email: "",
                    accountantAccount: "",
                    paymentMode: 0,
                    paymentDelay: 0,
                    referent: "",
                    phone: "",
                    partner: false,
                    code: "",
                    valid: true,
                    siren: "",
                    tvaNumber: ""
                },
                clientNumber: 0,
                type: ClientType.CLIENT,
                lang: "",
                birthDate: new Date(),
                newsLetter: false,
                siteOffer: false,
                partnerOffer: false,
                fidelityPoints: 0,
                credit: 0,
                clientAddress: [{
                    id: 0,
                    numero_client: 0,
                    designation: "",
                    civilite: "",
                    nom: "",
                    prenom: "",
                    adresse: "",
                    adresse2: "",
                    adresse3: "",
                    code_postal: "",
                    ville: "",
                    pays: "",
                    interphone: "",
                    code_porte: "",
                    instructions: "",
                    default: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                    societe: ""
                }],
                order: [],
                quotation: [],
                createdAt: new Date()
            },
        });
        
        expect(checkout.idClient).toBe(1);
        expect(checkout.idShop).toBe(1);
        expect(checkout.paymentMethod).toBe(PaymentMethod.CASH);
        expect(checkout.discountType).toBe(DiscountType.PERCENTAGE);
        expect(checkout.discountAmount).toBe('10');
        expect(checkout.totalHT).toBe('100');
        expect(checkout.totalTTC).toBe('120');
        expect(checkout.cbAmount).toBe('10');
        expect(checkout.cashAmount).toBe('10');
        expect(checkout.checkAmount).toBe('10');
    });
});