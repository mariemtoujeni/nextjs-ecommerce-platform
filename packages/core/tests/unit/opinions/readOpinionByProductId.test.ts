import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { setup, teardown } from "./_Setup";
import { readOpinionByProductIdUseCase } from "../../../src/usecases";

describe('readOpinionByProductId', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('should return all opinions for a product', async () => {
        const productId = 1;
        const opinions = await readOpinionByProductIdUseCase(productId);
        expect(opinions).toHaveLength(2);
    });
});