import { describe, it, expect } from "vitest";
import { getPublishedEventUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";

describe("getPublishedEventsUseCase", () => {
    it("should return published events", async () => {
        await signInTestUser(TestUser.ADMIN);
        const events = await getPublishedEventUseCase();        
        expect(events).toBeDefined();
        expect(events.length).toBeGreaterThanOrEqual(0);
    });
});

  
