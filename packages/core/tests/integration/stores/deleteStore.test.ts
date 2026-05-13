import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { deleteStoreUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";

describe("deleteStoreUseCase", () => {
  let supabase: SupabaseClient;
  const storeId = 77000;
  const clubId = 87000;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const club = await supabase.from("clubs").upsert({
      id: clubId,
      nom: "Temporary Club",
    }, { onConflict: "id" }).select().single();
    if (club.error) throw club.error;

    const { error } = await supabase.from("magasins").upsert({
      id: storeId,
      nom: "Temporary Store",
      actif: 0,
      id_club: clubId,
    }, { onConflict: "id" }).select().single();
    if (error) throw error;
  });

  afterAll(async () => {
      await supabase.from("magasins").delete().eq("id", storeId);
      await supabase.from("clubs").delete().eq("id", clubId);
  });

  it("should delete an existing store", async () => {
    const deleted = await deleteStoreUseCase(storeId);
    expect(deleted).toBeUndefined();
  });
});
