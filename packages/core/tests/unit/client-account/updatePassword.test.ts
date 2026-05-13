import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setup, teardown } from "./_Setup";
import { getInjection, UnauthorizedError } from "@repo/core/types";
import { updatePasswordClientUseCase } from "@repo/core/usecases";
import { SharedMemory } from "@repo/core/adapters/mock";

describe("updatePasswordClientUseCase", () => {
  beforeEach(() => {
    SharedMemory.users = [
      {
        id: "60",
        email: "test@exemple.com",
        password: "test",
        last_name: "Dupont",
        first_name: "Jean",
        is_anonymous: false,
        user_role: ""
      },
    ];
  });
   afterEach(async () => {
       teardown();
    });
      it("should throw UnauthorizedError if no user is logged in", async () => {
    await expect(updatePasswordClientUseCase({ password: "anotherPassword" })).rejects.toThrow(UnauthorizedError);
});

  it("should update password client", async () => {
    const authService = await getInjection("IAuthenticationService");  
    await authService.signIn("test@exemple.com", "test");
    const clientRepo = await getInjection("IClientRepository");
    await updatePasswordClientUseCase({ password: "newPassword123" });
    const user = SharedMemory.users.find(user => user.email === "test@exemple.com");
    expect(user).toBeDefined();
    expect(user?.password).toBe("newPassword123");

    // run usecase
    
  });

});