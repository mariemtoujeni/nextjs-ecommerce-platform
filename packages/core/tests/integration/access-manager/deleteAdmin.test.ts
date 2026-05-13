import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "../../../src/types";
import { deleteAdminUseCase, createAdminRoleUseCase, listAdminsUseCase } from "../../../src/usecases";
import { signInTestUser, TestUser } from "../utils";
import { AddAdminRequest, SignUpRequest } from "../../../src/models";

describe("deleteAdminUseCase", () => {
  let supabase: SupabaseClient;
  let adminId: string;

  beforeAll(async () => {
    await signInTestUser(TestUser.ADMIN);
    supabase = await getInjection("ISupabaseClient");   

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
  });

  afterAll(async () => {
    // disconnect
    await supabase.auth.signOut();
  });

  it("should delete an admin", async () => {
    await deleteAdminUseCase(adminId, "test@test.com");
    const admins = await listAdminsUseCase();
    // check that the admin is deleted
    const adminEmail = admins.items.find((admin) => admin.id === adminId)?.email;
    expect(adminEmail).toBeUndefined();
  });
});