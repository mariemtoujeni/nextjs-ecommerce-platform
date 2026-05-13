import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteDiscountUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("deleteDiscountUseCase", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should delete a discount", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    const discount = await deleteDiscountUseCase(1); 
    expect(discount).toBeUndefined();
  });

});
