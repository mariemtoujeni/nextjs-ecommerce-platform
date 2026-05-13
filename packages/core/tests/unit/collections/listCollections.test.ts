import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllCollectionsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("listCollectionsUseCase", () => {
    beforeEach(setup);
    afterEach(teardown);

    it("should return all collections", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const collections = await listAllCollectionsUseCase();
        expect(collections.items).toHaveLength(3);
    });
});