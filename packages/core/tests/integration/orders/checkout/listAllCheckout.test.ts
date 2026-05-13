import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listAllCheckoutsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../../utils";
import { DiscountType, PaymentMethod, ShopStatus } from "../../../../src/models";

describe("listAllCheckoutsUseCase", () => {
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
    });

    afterAll(async () => {
    });

    it("should return all checkouts", async () => {
        const checkouts = await listAllCheckoutsUseCase();
        expect(checkouts.total).toBeGreaterThan(500);
        expect(checkouts.count).toBeGreaterThan(500);
        expect(checkouts.items).toBeDefined();
        expect(checkouts.items).toBeInstanceOf(Array);
        expect(checkouts.items.length).toBe(checkouts.total);
        expect(checkouts.items[0]?.shop).toBeDefined();
        expect(checkouts.items[0]?.shop).toBeInstanceOf(Object);
    });

    it("should return all checkouts with filter paymentMethod", async () => {
        const checkouts = await listAllCheckoutsUseCase({
            filters: [{ key: 'paymentMethod', values: [PaymentMethod.CASH] }],
            limit: 10,
            offset: 0,
            sort: 'asc',
            search: '',
        });
        expect(checkouts.total).toBeGreaterThanOrEqual(62245);
        expect(checkouts.count).toBe(10);
        expect(checkouts.items).toBeDefined();
        expect(checkouts.items).toBeInstanceOf(Array);
    });

    it("should return all checkouts with filter discountType", async () => {
        const checkouts = await listAllCheckoutsUseCase({
            filters: [{ key: 'discountType', values: [DiscountType.PERCENTAGE] }],
            limit: 10,
            offset: 0,
            sort: 'asc',
            search: '',
        });
        expect(checkouts.total).toBeGreaterThanOrEqual(15);
        expect(checkouts.count).toBe(10);
        expect(checkouts.items).toBeDefined();
        expect(checkouts.items).toBeInstanceOf(Array);
    });

    it("should return all checkouts with filter status", async () => {
        const checkouts = await listAllCheckoutsUseCase({
            filters: [{ key: 'status', values: [ShopStatus.OPEN] }],
            limit: 10,
            offset: 0,
            sort: 'asc',
            search: '',
        });
        expect(checkouts.total).toBeGreaterThanOrEqual(1);
        expect(checkouts.count).toBeGreaterThanOrEqual(10);
        expect(checkouts.items).toBeDefined();
        expect(checkouts.items).toBeInstanceOf(Array);
    });

    it("should return all checkouts with search", async () => {
        const checkouts = await listAllCheckoutsUseCase({
            search: 'Point de vente de test de Ahmed',
            limit: 10,
            offset: 0,
            sort: 'asc',
        });        
        expect(checkouts.total).toBeGreaterThanOrEqual(18);
        expect(checkouts.count).toBeGreaterThanOrEqual(18);
        expect(checkouts.items).toBeDefined();
        expect(checkouts.items).toBeInstanceOf(Array);
    });
});