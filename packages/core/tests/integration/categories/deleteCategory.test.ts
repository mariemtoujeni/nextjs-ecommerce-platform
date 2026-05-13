import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { deleteCategoryUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";

describe("deleteCategoryUseCase", () => {
  let supabase: SupabaseClient;
  const categoryId = 75000;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const { error } = await supabase.from("categories").upsert({
      id: categoryId,
      nom: "Electronics",
      actif: 0,
      ordre: 99,
    }, { onConflict: "id" }).select().single();
    if (error) throw error;
  });

  afterAll(async () => {
      await supabase.from("categories").delete().eq("id", categoryId);
  });

  it("should delete an existing category", async () => {
    const deleted = await deleteCategoryUseCase(categoryId);
    expect(deleted).toBeUndefined();
  });
});
