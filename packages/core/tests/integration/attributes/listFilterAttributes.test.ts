import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { listFilterAttributesUseCase } from "../../../src/usecases";
import { signInTestUser, TestUser } from "../utils";

describe("listFilterAttributesUseCase", () => {
    beforeAll(async () => {
        await signInTestUser(TestUser.ADMIN);
    });

    afterAll(async () => {
    });

    it("should return the filter attributes", async () => {
        const filterAttributes = await listFilterAttributesUseCase();
        expect(filterAttributes).toBeDefined();
        expect(filterAttributes.length).toBeGreaterThan(0);
    });
});