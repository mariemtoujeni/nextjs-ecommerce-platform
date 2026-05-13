import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listAllProductModelsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";

describe("listAllProductModelsUseCase", () => {
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
    });

    afterAll(async () => {
    });

    it("should return all product models", async () => {
        const models = await listAllProductModelsUseCase({ options: {} });
        expect(models.items.length).toBeGreaterThan(0);        
        expect(models.items[0]?.attributValues?.length).toBeGreaterThanOrEqual(0);
        
        expect(models.items[0]?.product).toBeDefined();
        expect(models.items[0]?.product.id).toBeDefined();
        expect(models.items[0]?.product.descriptions[0]?.title).toBeDefined();
        expect(models.items[0]?.product.descriptions[0]?.description).toBeDefined();
        //expect(models.items[0]?.product.images[0]?.url).toBeDefined();
        //expect(models.items[0]?.product.images[0]?.productId).toBeDefined();
        expect(models.items[0]?.product.isGiftCard).toBeDefined();
    });

    it("should return all product models with search", async () => {
        const models = await listAllProductModelsUseCase({ options: { search: "SAREDOX" } });
        expect(models.items.length).toBeGreaterThan(0);
        expect(models.items.map(m => m.id)).toContain(717);
        expect(models.items[0]?.product.id).toBe(140);
        expect(models.items[0]?.product.descriptions[0]?.title).toBe("SAREDOX");
        expect(models.items[0]?.attributValues?.length).toBeGreaterThan(0);
    });

    it("should return all product models with search by barcode 1136912261211", async () => {
        const models = await listAllProductModelsUseCase({ options: { search: "1136912261211" } });
        expect(models.items.length).toBe(1);
        expect(models.items[0]?.id).toBe(24324);
        expect(models.items[0]?.product.id).toBe(140);
        expect(models.items[0]?.product.descriptions[0]?.title).toBe("SAREDOX");
        expect(models.items[0]?.attributValues?.length).toBeGreaterThan(0);
        expect(models.items[0]?.product).toBeDefined();
        expect(models.items[0]?.product.id).toBeDefined();
        expect(models.items[0]?.product.descriptions[0]?.title).toBeDefined();
    });
});