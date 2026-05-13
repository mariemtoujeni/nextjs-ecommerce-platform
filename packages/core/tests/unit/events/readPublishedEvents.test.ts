import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPublishedEventUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe('getPublishedEvent', () => {
    beforeEach(setup);

    afterEach(teardown);
    it('should return published Event ', async () => {        
        const event = await getPublishedEventUseCase();
        expect(event).toEqual([{
            id: 1,
            name: "Spring Sale 2024",
            status: 1,
            image: "https://example.com/images/spring-sale.jpg",
            description: "Enjoy massive discounts during our Spring Sale event.",
            startDate: new Date("2024-03-01"),
            endDate: new Date("2024-03-31"),
            createdAt: new Date("2024-02-15"),
            url: "https://example.com/events/spring-sale-2024"
        }])
        
    })
})