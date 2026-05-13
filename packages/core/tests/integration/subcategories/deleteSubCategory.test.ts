import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { deleteSubCategoryUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";

describe("deleteSubCategoryUseCase", () => {
  let supabase: SupabaseClient;
  const subCategoryId = 76000;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const { error } = await supabase.from("sous_categories").upsert({
      id: subCategoryId,
      nom: "Temporary Sub",
      actif: 0,
      ordre: 99,
    }, { onConflict: "id" }).select().single();
    if (error) throw error;
  });

  afterAll(async () => {
      await supabase.from("sous_categories").delete().eq("id", subCategoryId);
  });

  it("should delete an existing subcategory", async () => {
    const deleted = await deleteSubCategoryUseCase(subCategoryId);
    expect(deleted).toBeUndefined();
  });
});
