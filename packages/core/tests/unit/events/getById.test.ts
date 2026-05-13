import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getEventByIdUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe('getEventById', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return Event by ID', async () => {
        const authService = await getInjection("IAuthenticationService");
        await authService.signIn("admin@admin.com", "admin");
        const event = await getEventByIdUseCase(1);
        expect(event).toEqual({
            id: 1,
            name: "Spring Sale 2024",
            status: 1,
            image: "https://example.com/images/spring-sale.jpg",
            description: "Enjoy massive discounts during our Spring Sale event.",
            startDate: new Date("2024-03-01"),
            endDate: new Date("2024-03-31"),
            createdAt: new Date("2024-02-15"),
            url: "https://example.com/events/spring-sale-2024"
        })
        await authService.signOut();
    })
})