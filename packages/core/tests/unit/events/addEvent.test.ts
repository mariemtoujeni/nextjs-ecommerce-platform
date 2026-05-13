import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addEventUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";


describe("addEventUseCase", () => {
    beforeEach(setup);

    afterEach(teardown);

    it("should add an event", async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");

        const event = await addEventUseCase({
            name: "Winter Launch",
            image: "https://example.com/images/winter-launch.jpg",
            description: "Join us for our exciting winter product launch event.",
            startDate: new Date("2025-01-01"),
            endDate: new Date("2025-03-15"),
            url: "https://example.com/events/winter-launch"
        });

        expect(event).toEqual({
            name: "Winter Launch",
            image: "https://example.com/images/winter-launch.jpg",
            description: "Join us for our exciting winter product launch event.",
            startDate: new Date("2025-01-01"),
            endDate: new Date("2025-03-15"),
            url: "https://example.com/events/winter-launch"
        });
        await authService.signOut();
    });
});

