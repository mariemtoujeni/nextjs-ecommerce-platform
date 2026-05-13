import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { updateStoreUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "@repo/core/types";
import { signInTestUser, TestUser } from "../utils";
import { Store } from "@repo/core/models";

describe("updateStoreUseCase", () => {
  let supabase: SupabaseClient;
  const storeId = 77010;
  const clubId = 87010;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const club = await supabase.from("clubs").upsert({
      id: clubId,
      nom: "Temporary Club",
    }, { onConflict: "id" }).select().single();
    if (club.error) throw club.error;


    const { error } = await supabase.from("magasins")
      .upsert({
        id: storeId,
        nom: "Old Store",
        actif: 1,
        id_club: clubId,
      }, { onConflict: "id" }).select().single();
    if (error) throw error;
  });

  afterAll(async () => {
      await supabase.from("magasins").delete().eq("id", storeId);
  });

  it("should update an existing store", async () => {
    const updatedStore: Store = {
      id: storeId,
      name: "Updated Store",
      active: 0,
      order: 1,
    };

    const result = await updateStoreUseCase(updatedStore);

    expect(result).toBeDefined();
    expect(result.id).toBe(storeId);
    expect(result.name).toBe("Updated Store");
    expect(result.active).toBe(0);
  });
});
