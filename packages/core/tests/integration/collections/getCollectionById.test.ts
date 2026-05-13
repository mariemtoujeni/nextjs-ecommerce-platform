import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { getCollectionByIdUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";

describe("getCollectionByIdUseCase", () => {
  const name = "Test Collection for getById";
  let supabase: SupabaseClient;
  let collectionId: number;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const { data, error } = await supabase
      .from("collections")
      .insert({ nom: name, actif: 1 })
      .select("id")
      .single();

    if (error) throw error;
    collectionId = data.id;
  });

  afterAll(async () => {
    await supabase.from("collections").delete().eq("id", collectionId);
  });

  it("should return a collection", async () => {
    const collection = await getCollectionByIdUseCase(collectionId);

    expect(collection).toBeDefined();
    expect(collection.general.id).toBe(collectionId);
    expect(collection.general.name).toBe(name);
    expect(collection.general.active).toBe(1);
  });
});
