import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addCategoryUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("addCategoryUseCase", () => {
  beforeEach(async () => { await setup() });
  afterEach(async () => { await teardown() });

  it("should add a category", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    const category = await addCategoryUseCase({
      name: "Cars",
      active: 1,
      order: 1,
    });
    expect(category.name).toBe("Cars");
    expect(category.active).toBe(1);
    expect(category.order).toBe(1);
  });
});

