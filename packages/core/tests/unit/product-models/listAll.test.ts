import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllProductModelsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe("listAllProductModelsUseCase", () => {
    beforeEach(async () => {
        await setup();
    });

    afterEach(async () => {
        await teardown();
    });

    it("should return all product models", async () => {
        const models = await listAllProductModelsUseCase({ options: {} });
        expect(models.items.length).toBe(1);
        expect(models.items[0]?.id).toBe(1);
        expect(models.items[0]?.product?.id).toBe(1);
        expect(models.items[0]?.product?.descriptions[0]?.title).toBe("Product 1");
        expect(models.items[0]?.product?.descriptions[0]?.description).toBe("Product 1 description");
        expect(models.items[0]?.product?.images[0]?.url).toBe("https://example.com/image.jpg");
        expect(models.items[0]?.attributValues).toHaveLength(1);
        expect(models.items[0]?.attributValues?.[0]?.idModel).toBe(1);
        expect(models.items[0]?.attributValues?.[0]?.idAttributValue).toBe(1);
        expect(models.items[0]?.attributValues?.[0]?.attributValue?.nom).toBe("Attribut Value 1");
    });
});