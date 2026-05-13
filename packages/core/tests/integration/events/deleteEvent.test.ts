import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { deleteEventUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "@repo/core/types";
import { signInTestUser, TestUser } from "../utils";

describe("deleteEventUseCase", () => {
  let supabase: SupabaseClient;

  const eventId = 886592;;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    let { error: error } = await supabase
      .from('evenements')
      .upsert([{
        id: eventId,
        nom: "Test Event to Delete", 
      }]);
    if (error) throw error;
  });

  afterAll(async () => {

    let { error: error } = await supabase
      .from('evenements')
      .delete()
      .eq('id', eventId);
    if (error) console.error('Failed to delete event:', error);

  });

  it("should delete the event added", async () => {
    const result = await deleteEventUseCase(eventId);
    expect(result).toBeUndefined();

    const { data, error } = await supabase
      .from('evenements')
      .select('*')
      .eq('id', eventId);

    if (error) throw error;
    expect(data).toHaveLength(0);
  });
});
