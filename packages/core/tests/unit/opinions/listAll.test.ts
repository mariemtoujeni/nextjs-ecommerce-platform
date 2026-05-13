import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { setup, teardown } from "./_Setup";
import { listAllOpinionsUseCase } from "../../../src/usecases";

describe('listAllOpinions', () => {
     beforeEach(setup);
    afterEach(teardown);

    it('should return all opinions', async () => {
        const opinions = await listAllOpinionsUseCase();
        expect(opinions.count).toBe(2);
        expect(opinions.items).toHaveLength(2);
    })
}
)