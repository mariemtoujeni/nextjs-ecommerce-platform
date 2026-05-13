import { describe, expect, it } from "vitest";
import { listAllDiscountsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";

describe('listAllDiscounts', () => {
    it('should return 50 discounts with a total of > 400', async () => {
        await signInTestUser(TestUser.ADMIN);

        let discounts = await listAllDiscountsUseCase();
        expect(discounts.items.length).toBeGreaterThan(0);
        expect(discounts.total).toBeGreaterThan(400);
        expect(discounts.count).toEqual(discounts.items.length);
        expect(discounts.count).toEqual(50);

        expect(discounts.items[0]?.id).toBeGreaterThan(discounts.items[1]?.id ?? 0);

        discounts = await listAllDiscountsUseCase({sort: "asc"});
        expect(discounts.items[0]?.id).toBeLessThan(discounts.items[1]?.id ?? 0);

        const item = discounts.items[0];
        expect(item?.boutique).toBeDefined();
        expect(item?.code).toBeDefined();
        expect(item?.combinaison).toBeDefined();
        expect(item?.date_debut).toBeDefined();
        expect(item?.date_fin).toBeDefined();
        expect(item?.etat).toBeDefined();
        expect(item?.id).toBeDefined();
        expect(item?.id).toBeGreaterThan(0);
        expect(item?.type).toBeDefined();
        expect(item?.valeur_condition_achat_min).toBeDefined();
    })
})