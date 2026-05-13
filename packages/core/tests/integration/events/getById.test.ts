import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { getEventByIdUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";

describe("getEventByIdUseCase", () => {
  const eventInput = {
    name: "Test Event Get",
    image: "https://example.com/test.jpg",
    description: "Test desc",
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-07-02"),
    url: "https://example.com/test",
  };

  let supabase: SupabaseClient;
  let eventId: number;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const { data, error } = await supabase
      .from("evenements")
      .insert({
        nom: eventInput.name,
        image: eventInput.image,
        description: eventInput.description,
        dateDebut: eventInput.startDate.toISOString(),
        dateFin: eventInput.endDate.toISOString(),
        url: eventInput.url,
      })
      .select("id")
      .single();

    if (error) throw error;
    eventId = data.id;
  });

  afterAll(async () => {
    await supabase.from("evenements").delete().eq("id", eventId);
  });

  it("should return an event by ID", async () => {
    const event = await getEventByIdUseCase(eventId);

    expect(event).toBeDefined();
    expect(event.id).toBe(eventId);
    expect(event.name).toBe(eventInput.name);
    expect(event.image).toBe(`/api/assets/${eventInput.image}`);
    expect(event.description).toBe(eventInput.description);
    expect(new Date(event.startDate)).toEqual(eventInput.startDate);
    expect(new Date(event.endDate)).toEqual(eventInput.endDate);
    expect(event.url).toBe(eventInput.url);
  });
});
