import { afterEach, beforeEach, describe, it, expect } from "vitest";
import { setup, teardown } from "./_Setup";
import { createOpinionUseCase } from "../../../src/usecases";
import { Opinion } from "@repo/core/models";

describe('createOpinion', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('should create an opinion', async () => {
        const opinion: Opinion = {
            id: 3,
            productId: 2,
            userId: 3,
            pseudo: 'test',
            email: 'test@test.fr',
            title: 'Great product',
            text: 'I love this product',
            rating: 5,
            createdAt: new Date(),
            modelId: 1,
            commandId: 1,
            responseAdmin: '',
            validated: true,
            actif: true,
            product: {
                id: 0
            },
            client: {
                userId: "",
                email: "",
                firstName: "",
                lastName: "",
                phone: "",
                mobilePhone: "",
                clientNumber: 0
            },
            descriptions: [],
            images: []
        };

        const createdOpinion = await createOpinionUseCase(opinion);
        expect(createdOpinion).toMatchObject(opinion);

    });
});