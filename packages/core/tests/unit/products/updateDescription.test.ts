import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ProductDescriptionUpdate } from "../../../src/models/Product";
import { updateDescriptionUseCase } from "../../../src/usecases/products/updateDescription";
import { getInjection } from "../../../src/types/di";
import { UnauthorizedError } from "../../../src/types/error";
import { setup, teardown } from "./_Setup";

describe("updateDescription", () => {
    const update: ProductDescriptionUpdate = {
        title: "test",
        lang: "fr",
        description: "test"
    }
    beforeEach(setup);
    afterEach(teardown);

    it("should update the description of a product", async () => {
        const authService = await getInjection("IAuthenticationService");
        
        await authService.signIn("admin@admin.com", "admin");

        await updateDescriptionUseCase(1, update);

        const productRepository = await getInjection("IProductRepository");
        const product = await productRepository.readById(1);
        expect(product.descriptions[0]?.title).toBe(update.title);
        expect(product.descriptions[0]?.lang).toBe(update.lang);
        expect(product.descriptions[0]?.description).toBe(update.description);

        await authService.signOut();
    })

    it("should not update the description of a product if the user is not authenticated", async () => {
        await expect(updateDescriptionUseCase(1, update)).rejects.toThrow(UnauthorizedError);
    })
})