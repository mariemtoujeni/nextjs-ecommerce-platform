import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllProductAlertsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe('listAllProductAlerts', () => {
    beforeEach(async () => { await setup(); });
    afterEach(async () => { await teardown(); });


    it('should return all product alerts', async () => {
        const productAlerts = await listAllProductAlertsUseCase();
        expect(productAlerts.total).toBe(10);
        expect(productAlerts.count).toBe(10);
        expect(productAlerts.items).toHaveLength(10);
    })

    it('Should return only the last 2 product alerts', async () => {
        const productAlerts = await listAllProductAlertsUseCase({
            limit: 2,
            offset: 0,
        });
        expect(productAlerts.total).toBe(10);
        expect(productAlerts.count).toBe(2);
        expect(productAlerts.items).toHaveLength(2);

        expect(productAlerts.items[0]?.id).toBeGreaterThan(productAlerts.items[1]?.id ?? 0);
    })

    it('Should return only the first 2 product alerts', async () => {
        const productAlerts = await listAllProductAlertsUseCase({
            limit: 2,
            offset: 0,
            sort: "asc",
        });
        expect(productAlerts.total).toBe(10);
        expect(productAlerts.count).toBe(2);
        expect(productAlerts.items).toHaveLength(2);

        expect(productAlerts.items[0]?.id).toBeLessThan(productAlerts.items[1]?.id ?? 0);
    })

    it('Should return only the 2 product alerts at position 3 and 4', async () => {
        const productAlerts = await listAllProductAlertsUseCase({
            limit: 2,
            offset: 2,
            sort: "asc",
        });
        expect(productAlerts.total).toBe(10);
        expect(productAlerts.count).toBe(2);
        expect(productAlerts.items).toHaveLength(2);

        expect(productAlerts.items[0]?.id).toBe(3);
        expect(productAlerts.items[1]?.id).toBe(4);
    })
})