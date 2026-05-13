import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteClientDataUseCase } from "../../../src/usecases";
import { setup, teardown } from "./_Setup";
import { SharedMemory } from "../../../src/adapters/mock";
import { UserWithPassword } from "../../../src/models";
import { getInjection } from "../../../src/types/di";

describe("deleteClientUseCase", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

  it("should delete a client", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    
    const usertoDelete : UserWithPassword = {
        id: "1",
        last_name: "Garnier",
        first_name: "Laurent",
        email: "laurent.garnier@example.com",
        password: "",
        is_anonymous: true,
        user_role: "client",
    }
    SharedMemory.users.push(usertoDelete);


    const client = await deleteClientDataUseCase(1); 
    expect(client.email).toBe("non-compte@nataquashop.com");
    expect(client.firstName).toBe("Anonymous");

    const associatedUser = SharedMemory.users.find((u => u.id === client.userId));
    expect(associatedUser?.id).toBe(client.userId);
  });
});
