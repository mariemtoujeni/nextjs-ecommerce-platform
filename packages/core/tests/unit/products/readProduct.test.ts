import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readProductUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe('readProduct', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return all products', async () => {
        const products = await readProductUseCase(1);
        expect(products).toBeDefined();
    })

    
})