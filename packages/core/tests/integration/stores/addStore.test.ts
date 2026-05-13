import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addStoreUseCase } from "@repo/core/usecases";
import { SupabaseClient } from "@supabase/supabase-js";
import { signInTestUser, TestUser } from "../utils";
import { getInjection } from "@repo/core/types";

describe("addStoreUseCase", () => {
  let supabase: SupabaseClient;
  let storeId: number;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");

  });

  afterAll(async () => {
    if (storeId) {
      await supabase.from("magasins").delete().eq("id", storeId);
    }
  });

  it("should add a new store", async () => {
    const store = await addStoreUseCase({
      name: "Downtown Store Test",
      active: 1,
      order: 90,
    });

    expect(store).toBeDefined();
    expect(store.name).toBe("Downtown Store Test");
    expect(store.active).toBe(1);
    expect(store.order).toBe(90);

    storeId = store.id;
  });
});
