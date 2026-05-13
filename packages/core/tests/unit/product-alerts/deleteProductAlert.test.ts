import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllProductAlertsUseCase, deleteProductAlertUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe('deleteProductAlerts', () => {
    beforeEach(async () => { await setup(); });
    afterEach(async () => { await teardown(); });


    it('should delete a product alert', async () => {

        await deleteProductAlertUseCase(2);
        const productAlerts = await listAllProductAlertsUseCase();
        expect(productAlerts.total).toBe(9);

    })
})