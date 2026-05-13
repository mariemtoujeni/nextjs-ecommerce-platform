import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { addEventUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";
import { signInTestUser, TestUser } from "../utils";

describe("addEventUseCase", () => {
  let supabase: SupabaseClient;
  let eventId: number;

  const input = {
    name: "Winter Launch",
    image: "https://example.com/images/winter-launch.jpg",
    description: "Join us for our exciting winter product launch event.",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-03-15"),
    url: "https://example.com/events/winter-launch",
  };

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");
  });

  afterAll(async () => {
      const { error } = await supabase
        .from("evenements")
        .delete()
        .eq("id", eventId);
      if (error) {
        console.error("Failed to delete event:", error);
      }
  });

  it("should add an event", async () => {
    const event = await addEventUseCase(input);
    eventId = event.id;

    expect(event.name).toBe(input.name);
    expect(event.image).toBe(`/api/assets/${input.image}`);
    expect(event.description).toBe(input.description);
    expect(event.url).toBe(input.url);
    expect(new Date(event.startDate)).toEqual(input.startDate);
    expect(new Date(event.endDate)).toEqual(input.endDate);
  });
});
