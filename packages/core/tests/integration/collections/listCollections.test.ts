import { describe, expect, it } from "vitest";
import { listAllCollectionsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";

describe("listAllCollectionsUseCase", () => {
    it("should return all collections", async () => {
        await signInTestUser(TestUser.ADMIN);
        const collections = await listAllCollectionsUseCase();
        
        expect(collections.items.length).toBeGreaterThan(87);
        expect(collections.items[0]).toHaveProperty("id");
        expect(collections.items[0]).toHaveProperty("name");
        expect(collections.items[0]).toHaveProperty("active");
    });
});