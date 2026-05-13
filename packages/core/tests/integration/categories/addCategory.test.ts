import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addCategoryUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";

describe("addCategoryUseCase", () => {
  let supabase: SupabaseClient;
  let categoryId: number;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");
  });

  afterAll(async () => {
      await supabase.from("categories").delete().eq("id", categoryId);
  });

  it("should add a new category", async () => {
    const category = await addCategoryUseCase({
      name: "Cars",
      active: 1,
      order: 99,
    });

    expect(category).toBeDefined();
    expect(category.name).toBe("Cars");
    expect(category.active).toBe(1);
    expect(category.order).toBe(99);

    categoryId = category.id;
  });
});
