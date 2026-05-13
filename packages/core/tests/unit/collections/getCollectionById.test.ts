import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCollectionByIdUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("getCollectionByIdUseCase", () => {
    beforeEach(setup);
    afterEach(teardown);
   
    it("should return a collection", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const collection = await getCollectionByIdUseCase(1);
        expect(collection).toBeDefined();
        expect(collection.general.id).toBe(1);
        expect(collection.general.name).toBe("Collection 1");
        expect(collection.general.active).toBe(1);
        expect(collection.products.items.length).toBe(3);
        expect(collection.products.items[0]?.product?.id).toBe(1);
        expect(collection.products.items[0]?.product?.descriptions[0]?.title).toBe("Maillot une pièce noir");
        expect(collection.products.items[0]?.product?.descriptions[0]?.description).toBe("Maillot de bain une pièce élégant et confortable");
        expect(collection.products.items[0]?.product?.price).toBe(89.99);
        expect(collection.products.items[0]?.product?.vatRate).toBe(20);
        expect(collection.products.items[0]?.product?.isGiftCard).toBe(false);
        expect(collection.products.items[0]?.product?.images[0]?.url).toBe("https://example.com/swimsuit1.jpg");
    });

    it("should throw an error if the collection is not found", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(getCollectionByIdUseCase(999)).rejects.toThrow('Collection with ID 999 not found');
    });
});