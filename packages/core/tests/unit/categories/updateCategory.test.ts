import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateCategoryUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { Category } from "../../../src/models";
import { getInjection } from "../../../src/types/di";


describe("updateCategoryUseCase", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

  it("should update an existing category", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    const updatedCategory: Category = {
      id: 100,
      name: "Updated Category",
      active: 0,
      order: 2,
    };
    const category = await updateCategoryUseCase(updatedCategory);
    expect(category.id).toBe(100);
    expect(category.name).toBe("Updated Category");
    expect(category.active).toBe(0);
    expect(category.order).toBe(2);
  });
});
