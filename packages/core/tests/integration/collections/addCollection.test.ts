import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { addCollectionUseCase } from "@repo/core/usecases";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";
import { SupabaseClient } from "@supabase/supabase-js";

describe("addCollectionUseCase", () => {
  const collectionId = 2147483646;
  const name = `Test Collection with id ${collectionId}`;
  let supabase: SupabaseClient;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");
  });

  afterAll(async () => {
    await supabase.from("collections").delete().eq("id", collectionId);
  });

  it("should add a collection", async () => {
    const collection = await addCollectionUseCase({
      id: collectionId,
      name,
      active: 1,
    });

    expect(collection.id).toBe(collectionId);
    expect(collection.name).toBe(name);
    expect(collection.active).toBe(1);

    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    expect(data).toBeDefined();
    expect(data.nom).toBe(name);
  });
});
