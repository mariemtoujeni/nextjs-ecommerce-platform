import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";
import { createAdminRoleUseCase, deleteAdminUseCase } from "../../../src/usecases";
import { AddAdminRequest, SignUpRequest } from "../../../src/models";
import { signInTestUser, TestUser } from "../utils";

describe("createAdminRoleUseCase", () => {
  let supabase: SupabaseClient;
  let adminId: string;

  beforeAll(async () => {
    supabase = await getInjection("ISupabaseClient");
  });

  afterAll(async () => {
    // delete the admin
    await deleteAdminUseCase(adminId, "test@test.com");
  });

  it("should create an admin", async () => {
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
    adminId = admin.id;
    expect(admin).toBeDefined();
    expect(admin.id).toBeDefined();
    expect(admin.email).toBe("test@test.com");
    expect(admin.prenom).toBe("Test");
    expect(admin.nom).toBe("Test");
    expect(admin.role).toBe("admin.super");
  });
});