import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { setup, teardown } from "./_Setup";
import { updateOpinionUseCase } from "../../../src/usecases";
import { Opinion } from "@repo/core/models";

describe('updateOpinion', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('should update an opinion', async () => {
        const opinion = {
            id : 1,            
            productId : 1,
            userId : 3,
            pseudo : 'test',
            email : 'test@test.fr',
            title : 'bad product',
            text : 'I dont love this product',
            rating : 5,
            createdAt : new Date(),
            modelId : 1,
            commandId : 1,
            responseAdmin : '',
            validated : true,
            actif : true,
        };

        // TODO : changer par un objet spéficique à l'update
        const updatedOpinion = await updateOpinionUseCase(opinion as Opinion);
        expect(updatedOpinion.text).toEqual(opinion.text);
    });
});