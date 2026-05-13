import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { updateCategoryUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";
import { Category } from "@repo/core/models";


describe("updateCategoryUseCase", () => {
  let supabase: SupabaseClient;
  const categoryId = 75010;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

    const { data, error } = await supabase.from("categories")
      .upsert({
        id: categoryId,
        nom: "Old Category",
        actif: 1,
        ordre: 1,
      }, { onConflict: "id" }).select().single();
    if (error) throw error;
  });

  afterAll(async () => {
      await supabase.from("categories").delete().eq("id", categoryId);
  });

  it("should update an existing category", async () => {
    const updatedCategory : Category = {
      id: categoryId,
      name: "Updated Category",
      active: 0,
      order: 2,
    };

    const result = await updateCategoryUseCase(updatedCategory);
    expect(result).toBeDefined();
    expect(result.id).toBe(categoryId);
    expect(result.name).toBe("Updated Category");
    expect(result.active).toBe(0);
    expect(result.order).toBe(2);
  });
});
