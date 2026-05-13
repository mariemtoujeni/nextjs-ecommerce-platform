import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteCollectionUseCase, getCollectionByIdUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("deleteCollectionUseCase", () => {
    beforeEach(setup);
    afterEach(teardown);
    
    it("should delete a collection", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await deleteCollectionUseCase(1);
        await expect(getCollectionByIdUseCase(1)).rejects.toThrow('Collection with ID 1 not found');
    });

    it("should throw an error if the collection is not found", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(deleteCollectionUseCase(999)).rejects.toThrow('Collection with ID 999 not found');
    });
    
});