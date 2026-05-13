import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addProductAlertUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("addProductAlertUseCase", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should create a product alert", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    const newAlert = {
      idModel: 1001,
      email: "admin@admin.com",
    }

    const result = await addProductAlertUseCase(newAlert);

    expect(result).toMatchObject({      
      email: "admin@admin.com",
      isEmailSent: false
    });

  });
});
