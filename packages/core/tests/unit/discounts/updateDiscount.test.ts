import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { updateDiscountUseCase } from "../../../src/usecases/discounts";
import { setup, teardown } from "./_Setup";
import { Discount, DiscountCombination, DiscountState, DiscountTypeProduct, DiscountTypeValue, MinPurchaseCondition, ProductShop } from "../../../src/models/Discount";
import { getInjection } from "../../../src/types/di";
import { SharedMemory } from "@repo/core/adapters/mock";
import { ReductionType, ReductionValueType } from "src";

describe("updateDiscountUseCase", () => {

    const discountToUpdate: Discount = {
        id: 123,
        etat: DiscountState.ACTIVE,
        nom: "Summer Splash Discount",
        type: ReductionType.CLUB,
        id_club: 42,
        code: "SUMMER25",
        combinaison: null,
        boutique: ProductShop.NATAQUASHOP,
        date_debut: new Date("2025-06-01T00:00:00Z"),
        date_fin: new Date("2025-08-31T23:59:59Z"),
        id_user: "user_9876",
        type_condition_achat_min: MinPurchaseCondition.MONTANT,
        valeur_condition_achat_min: 50,
        nombre_maximal_utilisation: 200,
        discountLines: [
            {
                id: 1,
                id_reduction: 123,
                type: DiscountTypeProduct.EN_PROMO,
                type_valeur: ReductionValueType.PERCENTAGE,
                valeur: 25,
                id_type: 0,
                country_code: "",
                discount: {} as Discount
            },
            {
                id: 2,
                id_reduction: 123,
                type: DiscountTypeProduct.EN_PROMO,
                type_valeur: ReductionValueType.MONTANT,
                valeur: 10,
                id_type: 0,
                country_code: "",
                discount: {} as Discount
            }
        ]
    };

    

    beforeEach(async () => { 
        await setup(); 
        SharedMemory.discounts.push(discountToUpdate);
        SharedMemory.discountLines.push(discountToUpdate.discountLines[0]!);
        SharedMemory.discountLines.push(discountToUpdate.discountLines[1]!);
    });
    afterEach(async () => { await teardown(); });

    it("should update all fields of a discount including discount lines", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const updated = await updateDiscountUseCase({
            id: discountToUpdate.id,
            etat: DiscountState.INACTIVE,
            nom: "Autumn Mega Discount",
            type: ReductionType.ADHERENT_CLUB,
            id_club: 77,
            code: "AUTUMN50",
            combinaison: DiscountCombination.PRODUIT,
            boutique: ProductShop.CRAZYSWIM,
            date_debut: new Date("2025-09-01T00:00:00Z"),
            date_fin: new Date("2025-12-31T23:59:59Z"),
            id_user: "user_5555",
            type_condition_achat_min: MinPurchaseCondition.QUANTITE_PRODUIT,
            valeur_condition_achat_min: 5,
            nombre_maximal_utilisation: 500,
            discountLines: [
                {
                    id: 1,
                    id_reduction: discountToUpdate.id,
                    type: DiscountTypeProduct.COLLECTION,
                    type_valeur: ReductionValueType.MONTANT,
                    valeur: 15,
                    id_type: 2,
                    country_code: "",
                    discount: {} as Discount
                },
                {
                    id: 2,
                    id_reduction: discountToUpdate.id,
                    type: DiscountTypeProduct.MODELE,
                    type_valeur: ReductionValueType.PERCENTAGE,
                    valeur: 50,
                    id_type: 2,
                    country_code: "",
                    discount: {} as Discount
                }
            ]
        });

        expect(updated.etat).toBe(DiscountState.INACTIVE);
        expect(updated.nom).toBe("Autumn Mega Discount");
        expect(updated.type).toBe(ReductionType.ADHERENT_CLUB);
        expect(updated.id_club).toBe(77);
        expect(updated.code).toBe("AUTUMN50");
        expect(updated.combinaison).toBe(DiscountCombination.PRODUIT);
        expect(updated.boutique).toBe(ProductShop.CRAZYSWIM);
        expect(updated.date_debut).toEqual(new Date("2025-09-01T00:00:00Z"));
        expect(updated.date_fin).toEqual(new Date("2025-12-31T23:59:59Z"));
        expect(updated.id_user).toBe("user_5555");
        expect(updated.type_condition_achat_min).toBe(MinPurchaseCondition.QUANTITE_PRODUIT);
        expect(updated.valeur_condition_achat_min).toBe(5);
        expect(updated.nombre_maximal_utilisation).toBe(500);

        expect(updated.discountLines[0]?.type).toBe(DiscountTypeProduct.COLLECTION);
        expect(updated.discountLines[0]?.type_valeur).toBe(ReductionValueType.MONTANT);
        expect(updated.discountLines[0]?.valeur).toBe(15);
        expect(updated.discountLines[0]?.id_type).toBe(2);

        expect(updated.discountLines[1]?.type_valeur).toBe(ReductionValueType.PERCENTAGE);
        expect(updated.discountLines[1]?.valeur).toBe(50);

        await authService.signOut();
    });
});
