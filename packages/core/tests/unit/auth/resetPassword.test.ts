import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setup, teardown } from "./_Setup";
import { sendResetPasswordEmailUseCase } from "@repo/core/usecases";

describe("sendResetPasswordEmailUseCase", () => {
  beforeEach(setup);
  afterEach(teardown);
   it("should send reset password email successfully", async () => {
    const result = await sendResetPasswordEmailUseCase("user@test.com");
    expect(result.success).toBe(true);
    expect(result.userExists).toBe(true);
    expect(result.message).toBe("Email envoyé avec succès")

   })
  
})