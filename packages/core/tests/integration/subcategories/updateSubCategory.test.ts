import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { updateSubCategoryUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "@repo/core/types";
import { signInTestUser, TestUser } from "../utils";
import { SubCategory } from "@repo/core/models";

describe("updateSubCategoryUseCase", () => {
  let supabase: SupabaseClient;
  const subCategoryId = 76010;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const { error } = await supabase.from("sous_categories")
      .upsert({
        id: subCategoryId,
        nom: "Old Sub",
        actif: 1,
        ordre: 1,
      }, { onConflict: "id" }).select().single();
    if (error) throw error;
  });

  afterAll(async () => {
      await supabase.from("sous_categories").delete().eq("id", subCategoryId);
  });

  it("should update an existing subcategory", async () => {
    const updatedSubCategory : SubCategory = {
      id: subCategoryId,
      name: "Updated SubCategory",
      active: 0,
      order: 2,
    };

    const result = await updateSubCategoryUseCase(updatedSubCategory);

    expect(result).toBeDefined();
    expect(result.id).toBe(subCategoryId);
    expect(result.name).toBe("Updated SubCategory");
    expect(result.active).toBe(0);
    expect(result.order).toBe(2);
  });
});
