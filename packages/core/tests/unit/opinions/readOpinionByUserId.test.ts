import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { setup, teardown } from "./_Setup";
import { readOpinionByUserIdUseCase } from "../../../src/usecases";

describe('readOpinionByUserId', () => {
    beforeEach(setup);
   afterEach(teardown);

    it('should return all opinions for a user', async () => {
        const userId = 1;
        const opinions = await readOpinionByUserIdUseCase(userId);
        expect(opinions).toHaveLength(1);
    });
});

