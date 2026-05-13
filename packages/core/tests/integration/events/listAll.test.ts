import { describe, it, expect } from "vitest";
import { listAllEventsUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";

describe("listAllEventsUseCase", () => {

  it("should return all events", async () => {
    await signInTestUser(TestUser.ADMIN);
    const events = await listAllEventsUseCase();

    expect(events.items.length).toBeGreaterThanOrEqual(3);
    expect(events.total).toBeGreaterThanOrEqual(3);
    expect(events.count).toBeGreaterThanOrEqual(3);
  });
});
