import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getProductAdmin } from "@repo/core/usecases";
import { ProductState } from "@repo/core/models";
import { getInjection } from "@repo/core/types";
import { setup, teardown } from "./_Setup";

describe("Read admin product", () => {
    beforeEach(setup);
    afterEach(teardown);
    it("should return a product", async () => {
        const authService = await getInjection("IAuthenticationService");
        
        await authService.signIn("admin@admin.com", "admin");
        
        const product = await getProductAdmin(1);

        expect(product).toBeDefined();
        expect(product.id).toBe(1);
        expect(product.brand).toBeDefined();
        expect(product.category).toBeDefined();
        expect(product.subCategory).toBeDefined();
        expect(product.productAttributes).toBeDefined();
        expect(product.productAttributes?.length).toBe(2);
        expect(product.buyPriceWithoutVat).toBe(100);
        expect(product.manufacturerReference).toBe("1234567890");
        expect(product.comment).toBe("Comment 1");
        expect(product.state).toBe(ProductState.NORMAL);
    });
})