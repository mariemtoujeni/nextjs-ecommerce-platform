import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listAllReturnsUseCase } from "../../../../src/usecases/orders/returns";
import { signInTestUser, TestUser } from "../../utils";


describe("listAllReturnsUseCase", () => {
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
    });

    afterAll(async () => {
    });

    it("should return all returns", async () => {
        const returns = await listAllReturnsUseCase();
        expect(returns.total).toBeGreaterThan(0);
        expect(returns.count).toBeGreaterThan(0);
        expect(returns.items).toBeDefined();
        expect(returns.items).toBeInstanceOf(Array);
        expect(returns.items.length).toBeGreaterThan(0);
        
        const firstItem = returns.items[0];
        expect(firstItem).toBeDefined();
        expect(firstItem?.id).toBeDefined();
        expect(firstItem?.orderId).toBeDefined();
        expect(firstItem?.type).toBeDefined();
        expect(firstItem?.status).toBeDefined();
        expect(firstItem?.requestDate).toBeDefined();
        expect(firstItem?.receivedDate).toBeDefined();
        expect(firstItem?.trackingNumber).toBeDefined();
        expect(firstItem?.supportNumber).toBeDefined();
        expect(firstItem?.routingDebitCard).toBeDefined();
        expect(firstItem?.commandReceptionDate).toBeDefined();
        expect(firstItem?.returnReason).toBeDefined();
        expect(firstItem?.repaymentDate).toBeDefined();
        expect(firstItem?.reexpeditionDate).toBeDefined();
        expect(firstItem?.client).toBeDefined();
    });
});