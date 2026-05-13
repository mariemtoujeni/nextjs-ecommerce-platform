import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateEventUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { Event } from '@repo/core/models';
import { getInjection } from "../../../src/types/di";

describe("updateEventUseCase", () => {
  beforeEach(setup);

  afterEach(teardown);

  it("should update an existing event", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    const updatedEvent: Event = {
      id: 1,
      name: "Spring Sale 2025",
      status: 2,
      image: "https://example.com/images/springsale.jpg",
      description: "Discounts during our Spring Sale event.",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-31"),
      createdAt: new Date("2025-02-15"),
      url: "https://example.com/events/spring-sale-2025"
    };

    const event = await updateEventUseCase(updatedEvent);
    expect(event.id).toBe(1);
    expect(event.name).toBe("Spring Sale 2025");
    expect(event.status).toBe(2);
    expect(event.description).toBe("Discounts during our Spring Sale event.");
    await authService.signOut();
  });
});
