import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { setup, teardown } from "./_Setup";
import { readOpinionById } from "../../../src/usecases";

describe('readOpinionById', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('should return an opinion by id', async () => {
        const opinionId = 1;
        const opinion = await readOpinionById(opinionId);
        expect(opinion).toBeDefined();
        expect(opinion?.id).toBe(opinionId);
    });

    it('should throw an error if opinion not found', async () => {
        const opinionId = 999; // Assuming this ID does not exist
        await expect(readOpinionById(opinionId)).rejects.toThrow(`Opinion with id ${opinionId} not found`);
    });
});