import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteCategoryUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("deleteCategoryUseCase", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

  it("should delete a category", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    const category = await deleteCategoryUseCase(101); 
    expect(category).toBeUndefined();
  });
});
