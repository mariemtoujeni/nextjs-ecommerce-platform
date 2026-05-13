import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { updateEventUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";

describe("updateEventUseCase", () => {
  let supabase: SupabaseClient;
  const eventId = 9986595;

  const initialEvent = {
    name: "Initial Name",
    image: "https://example.com/img.jpg",
    description: "Initial Desc",
    statut: 1,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-01-10"),
    url: "https://example.com/initial",
  };

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const { error } = await supabase
      .from("evenements")
      .upsert([
        {
          id: eventId,
          nom: initialEvent.name,
          image: initialEvent.image,
          description: initialEvent.description,
          statut: initialEvent.statut,
          dateDebut: initialEvent.startDate,
          dateFin: initialEvent.endDate,
          url: initialEvent.url,
        },
      ]);
    if (error) throw error;
  });

  afterAll(async () => {
    const { error } = await supabase.from("evenements").delete().eq("id", eventId);
    if (error) console.error("Failed to clean up event:", error);
  });

  it("should update an existing event", async () => {
    const updatedData = {
      id: eventId,
      name: "Updated Name",
      image: initialEvent.image,
      description: "Updated Desc",
      startDate: initialEvent.startDate,
      endDate: initialEvent.endDate,
      url: initialEvent.url,
      status: initialEvent.statut,
      createdAt: new Date()
    };

    const updated = await updateEventUseCase(updatedData);

    expect(updated.name).toBe("Updated Name");
    expect(updated.description).toBe("Updated Desc");
  });
});
