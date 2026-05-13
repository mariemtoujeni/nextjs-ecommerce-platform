import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addCollectionUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("addCollectionUseCase", () => {
    beforeEach(setup);
    afterEach(teardown);

    it("should add a collection", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const collection = await addCollectionUseCase({
            name: "Collection 4",
            active: 1,
        });
        expect(collection).toBeDefined();
        expect(collection.id).toBe(4);
        expect(collection.name).toBe("Collection 4");
        expect(collection.active).toBe(1);
    });   

    it("should throw an error if the collection already exists", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(addCollectionUseCase({
            name: "Collection 1",
            active: 1,
        })).rejects.toThrow('Collection already exists');
    });

    it("should throw an error if the name is empty", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        await expect(addCollectionUseCase({
            name: "",
            active: 1,
        })).rejects.toThrow('Name is required');
    });    
});