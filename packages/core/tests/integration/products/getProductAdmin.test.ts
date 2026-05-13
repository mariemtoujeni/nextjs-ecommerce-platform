import { describe, it, expect } from "vitest";
import { getProductAdmin } from "@repo/core/usecases"
import { signInTestUser, TestUser } from "../utils";

describe('getProductAdmin', () => {
    it('should return a product when set productId', async () => {
        await signInTestUser(TestUser.ADMIN);
        const product = await getProductAdmin(15578);
        expect(product).toBeDefined(); 

        expect(product.id).toBe(15578);
        expect(product.productAttributes?.length).toBe(2);
    });

    it('should return a product when set modelId', async () => {
        await signInTestUser(TestUser.ADMIN);
        const product = await getProductAdmin(1, 124936);
        expect(product).toBeDefined(); 
        expect(product.id).toBe(14971);
    });
});

    
