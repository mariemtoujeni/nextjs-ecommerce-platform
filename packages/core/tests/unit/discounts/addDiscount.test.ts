import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addDiscountUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { DiscountState, TypeDiscount, DiscountCombination, ProductShop, MinPurchaseCondition } from "@repo/core/models";
import { getInjection } from "../../../src/types/di";


describe("addDiscountUseCase", () => {
    beforeEach(setup);

    afterEach(teardown);

    it("should add a discount for an order", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        const discount = await addDiscountUseCase(DiscountCombination.COMMANDE);

        expect(discount.etat).toBe(DiscountState.INACTIVE);
        expect(discount.nom).toBe("");
        expect(discount.type).toBe(TypeDiscount.COMMANDE);
        expect(discount.code).toBe("");
        expect(discount.boutique).toBe(ProductShop.NATAQUASHOP);
        expect(discount.type_condition_achat_min).toBe(MinPurchaseCondition.MONTANT);
        expect(discount.valeur_condition_achat_min).toBe(0);
        expect(discount.nombre_maximal_utilisation).toBe(-1);

    });

    it("should add a discount for a product", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        const discount = await addDiscountUseCase(DiscountCombination.PRODUIT);

        expect(discount.etat).toBe(DiscountState.INACTIVE);
        expect(discount.nom).toBe("");
        expect(discount.type).toBe(TypeDiscount.CAMPAGNE);
        expect(discount.code).toBe("");
        expect(discount.boutique).toBe(ProductShop.NATAQUASHOP);
        expect(discount.type_condition_achat_min).toBe(MinPurchaseCondition.MONTANT);
        expect(discount.valeur_condition_achat_min).toBe(0);
        expect(discount.nombre_maximal_utilisation).toBe(-1);

    });
});

