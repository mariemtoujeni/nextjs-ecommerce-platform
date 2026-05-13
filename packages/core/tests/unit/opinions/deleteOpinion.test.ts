import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { setup, teardown } from "./_Setup";
import { deleteOpinionUseCase, listAllOpinionsUseCase } from "../../../src/usecases";

describe("deleteOpinionUseCase", () => {
    beforeEach(setup);
    afterEach(teardown),

    it('should delete an opinion by ID', async () => {
        await deleteOpinionUseCase(1);

        const opinions = await listAllOpinionsUseCase();

        expect(opinions.count).toBe(1);
        expect(opinions.items).toHaveLength(1);
        expect(opinions.items[0]?.id).toBe(2);
    });
    

});