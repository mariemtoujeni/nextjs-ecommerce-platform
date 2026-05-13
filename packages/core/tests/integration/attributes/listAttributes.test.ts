import { expect, describe, it } from "vitest";
import { listAttributesUseCase } from '../../../src/usecases';
import { signInTestUser, TestUser } from "../utils";

describe('listAttributes', () => {
    it('should return attributes', async () => {
        await signInTestUser(TestUser.ADMIN);

        const attributes = await listAttributesUseCase();
        expect(attributes).toBeDefined();
        expect(attributes.length).toBeGreaterThanOrEqual(9);
    });
});