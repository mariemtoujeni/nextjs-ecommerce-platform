import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addSubCategoryUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";

describe("addSubCategoryUseCase", () => {
  let supabase: SupabaseClient;
  let subCategoryId: number;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");
  });

  afterAll(async () => {
      await supabase.from("sous_categories").delete().eq("id", subCategoryId);
  });

  it("should add a new subcategory", async () => {
    const subcategory = await addSubCategoryUseCase({
      name: "Electric Cars",
      active: 1,
      order: 42,
    });

    expect(subcategory).toBeDefined();
    expect(subcategory.name).toBe("Electric Cars");
    expect(subcategory.active).toBe(1);
    expect(subcategory.order).toBe(42);

    subCategoryId = subcategory.id;
  });
});
