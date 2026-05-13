import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllQuotationsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe('listAllQuotations', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return all quotations', async () => {
        const quotations = await listAllQuotationsUseCase();
        expect(quotations.total).toBe(10);
        expect(quotations.count).toBe(10);
        expect(quotations.items).toHaveLength(10);
    })

    it('Should return only the last 2 quotations', async () => {
        const quotations = await listAllQuotationsUseCase({
            limit: 2,
            offset: 0,
        });
        expect(quotations.total).toBe(10);
        expect(quotations.count).toBe(2);
        expect(quotations.items).toHaveLength(2);

        expect(quotations.items[0]?.clientNumber).toBeGreaterThan(quotations.items[1]?.clientNumber ?? 0);
    })

    it('Should return only the first 2 quotations', async () => {
        const quotations = await listAllQuotationsUseCase({
            limit: 2,
            offset: 0,
            sort: "asc",
        });
        expect(quotations.total).toBe(10);
        expect(quotations.count).toBe(2);
        expect(quotations.items).toHaveLength(2);

        expect(quotations.items[0]?.clientNumber).toBeLessThan(quotations.items[1]?.clientNumber ?? 0);
    })

    it('Should return only the 2 quotations at position 3 and 4', async () => {
        const quotations = await listAllQuotationsUseCase({
            limit: 2,
            offset: 2,
            sort: "asc",
        });
        expect(quotations.total).toBe(10);
        expect(quotations.count).toBe(2);
        expect(quotations.items).toHaveLength(2);

        expect(quotations.items[0]?.clientNumber).toBe(3);
        expect(quotations.items[1]?.clientNumber).toBe(4);
    })
})