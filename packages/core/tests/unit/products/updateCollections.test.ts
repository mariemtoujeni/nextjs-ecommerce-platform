import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { updateCollections } from "../../../src/usecases/products/updateCollections";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";
import { UnauthorizedError } from "../../../src/types/error";


describe("updateStores", () => {
    beforeEach(setup);
    afterEach(teardown);

    it("should update the collections of a product", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await updateCollections(1, [2, 3]);
        const collectionRepository = await getInjection("ICollectionRepository");
        const collections = await collectionRepository.readCollectionProductsByProductId(1);
        
        for(const c of collections) {
            expect(c.productId).toBe(1);
            expect([2, 3]).toContain(c.collectionId);
        }

        await authService.signOut();
    })

    it("should not update the collections of a product if the user is not authenticated", async () => {
        await expect(updateCollections(1, [2, 3])).rejects.toThrow(UnauthorizedError);
    })
})