import { describe, expect, it } from "vitest";
import { listAllProductAlertsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { ProductAlert } from "@repo/core/models";

describe('listAllProductAlerts', () => {

    it('should return all product alerts', async () => {
        await signInTestUser(TestUser.ADMIN);

        let productAlerts = await listAllProductAlertsUseCase();
        expect(productAlerts.items.length).toBeGreaterThan(0);
        expect(productAlerts.total).toBeGreaterThan(2200);
        expect(productAlerts.count).toEqual(productAlerts.items.length);
        expect(productAlerts.count).toEqual(50);

        expect(productAlerts.items[0]?.id).toBeGreaterThan(productAlerts.items[1]?.id ?? 0);

        productAlerts = await listAllProductAlertsUseCase({sort: "asc"});
        expect(productAlerts.items[0]?.id).toBeLessThan(productAlerts.items[1]?.id ?? 0);

        const item = productAlerts.items[0] as ProductAlert;
        expect(item.id).toBeDefined();
        expect(item.idModel).toBeDefined();
        expect(item.model).toBeDefined();
        expect(item.model.productDetails).toBeDefined();
        expect(item.client).toBeDefined();
        expect(item.clientNumber).toBeDefined();
        expect(item.email).toBeDefined();
        expect(item.isActif).toBeDefined();
        expect(item.isEmailSent).toBeDefined();
        expect(item.createdAt).toBeDefined();
    })

})