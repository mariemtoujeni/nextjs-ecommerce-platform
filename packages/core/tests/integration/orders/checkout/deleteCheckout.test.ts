import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { deleteCheckoutUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { getInjection, NotFoundError } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";

import { CreateCheckout, CreateCheckoutLineRequest, DiscountType, PaymentMethod } from "../../../../src/models";
import { mapFromType } from "../../../../src/adapters/supabase/MapToType";
import { CheckoutKeyMap, CheckoutLineKeyMap } from "../../../../src/adapters/supabase/CheckoutRepository";

describe('deleteCheckout', () => {
    let checkoutId = 0;
    let supabase: SupabaseClient;

    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
        supabase = await getInjection("ISupabaseClient");

        const checkout = {
            idClient: 1,
            idShop: 642,
            paymentMethod: 'ESPECE',
            discountType: 'POURCENTAGE',
            discountAmount: '10',
            totalHT: '100',
            totalTTC: '100',
            cbAmount: '100',
            cashAmount: '0',
            checkAmount: '0',
            NoVAT: false
        }

        const { data : checkoutData, error : checkoutError } = await supabase.from("caisses").insert(mapFromType(checkout, CheckoutKeyMap)).select().single();
        if (checkoutError) throw checkoutError;
        checkoutId = checkoutData.id;

        const checkoutLines = [
            {
                idCheckout: checkoutData.id,
                idModel: 717,
                name: "Test Model",
                codeBar: "1234567890",
                price: 100,
                quantity: 2,
                discount: 0,
                discountType: 'POURCENTAGE',
                VAT: 20,
                comment: "Test Comment"
            }
        ]

        const { data : checkoutLinesData, error : checkoutLinesError } = await supabase.from("caisse_lignes").insert(checkoutLines.map(line => mapFromType(line, CheckoutLineKeyMap))).select();
        if (checkoutLinesError) throw checkoutLinesError;

        const { data : shopLinesData, error : shopLinesError } = await supabase.from("point_vente_lignes").update({
            stock_vendu: 2,
            stock_final: 8,
            prix_total_ttc: 200
        }).eq("id_point_vente", 642).eq("id_modele", 717);
        if (shopLinesError) throw shopLinesError;
    });

    afterAll(async () => {        
        await supabase.from("point_vente_lignes").update({
            stock_initial: 10,
            stock_vendu: 0,
            stock_final: 10,
            prix_total_ttc: 0
        }).eq("id_point_vente", 642).eq("id_modele", 717);
    });

    it('should delete a checkout', async () => {
        const result = await deleteCheckoutUseCase(checkoutId);
        expect(result).toBe(true);
    });

    it('should not delete a checkout if it does not exist', async () => {
        await expect(deleteCheckoutUseCase(-1)).rejects.toThrow(NotFoundError);
    });
});