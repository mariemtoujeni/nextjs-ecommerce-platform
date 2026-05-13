import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";
import { validateInvitationUseCase } from "../../../src/usecases";
import { signInTestUser, TestUser } from "../utils";
import { AddAdminRequest, SignUpRequest } from "../../../src/models";
import { createAdminRoleUseCase, deleteAdminUseCase } from "../../../src/usecases";

describe("validateInvitation", () => {
  let supabase: SupabaseClient;
  let code: string;
  let adminId: string;

  beforeAll(async () => {
    supabase = await getInjection("ISupabaseClient");
    await signInTestUser(TestUser.ADMIN);
    
    const addAdminRequest : AddAdminRequest = {
      email: "test@test.com",
      prenom: "Test",
      nom: "Test",
      role: "admin.super"
    };

    const userToCreate : SignUpRequest = {
      email: "test@test.com",
      password: "Password123!",
      lastName: "Test",
      firstName: "Test",
      Address: "Test",
      postCode: "Test",
      city: "Test",
      country: "Test"
    };

    const timestamp: number = Date.now();
    const admin = await createAdminRoleUseCase(addAdminRequest, userToCreate, timestamp.toString());
    code = `${timestamp}`;
    // disconnect
    await supabase.auth.signOut();
  });

  afterAll(async () => {
    // delete the admin
    await signInTestUser(TestUser.ADMIN);
    await deleteAdminUseCase(adminId, "test@test.com");
    await supabase.auth.signOut();
  });

  it("should validate an invitation", async () => {
    const admin = await validateInvitationUseCase({
        code,
        password: "Password4789!",
        confirmPassword: "Password4789!"
    });
    expect(admin).toBeDefined();
    expect(admin.id).toBeDefined();
    adminId = admin.id;
    expect(admin.email).toBe("test@test.com");
  });
});