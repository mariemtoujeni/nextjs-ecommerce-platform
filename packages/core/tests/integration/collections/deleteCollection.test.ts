import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { deleteCollectionUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";

describe("deleteCollectionUseCase", () => {
  const collectionId = 2220000;
  let supabase: SupabaseClient;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const { error } = await supabase.from("collections").insert({
      id: collectionId,
      nom: "Test Collection to delete",
      actif: 1,
    });

    if (error) throw error;
  });

  afterAll(async () => {
    await supabase.from("collections").delete().eq("id", collectionId);
  });

  it("should delete a collection", async () => {
    await deleteCollectionUseCase(collectionId);

    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .maybeSingle();

    expect(data).toBeNull();
  });
});
