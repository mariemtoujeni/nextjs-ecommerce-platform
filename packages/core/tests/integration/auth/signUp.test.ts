import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "@repo/core/types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";


describe("sign up", () => {
  let supabase: SupabaseClient
  let email: string
  let userId: string | undefined
  let password: string;

  beforeAll(async () => {
    supabase = await getInjection("ISupabaseClient")
    email = `test-${Date.now()}@nataquashop.com`,
    password = "Password123!"
   
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom: "MartinTest",
          prenom: "MarieTest",
          date_naissance: "1990-01-01",
          telephone_domicile: "0123456789",
          telephone_portable: "0987654321",
          societe: "MaSociete",
          civilité: "M",
          adresse: "1 Rue de Test",
          adresse2: "Appartement 2",
          adresse3: "Bâtiment A",
          code_postal: "75001",
          ville: "Paris",
          pays: "France",
          
        },
      },
    })

    if (authError) {
      console.error("Failed to create user:", authError)
      throw authError
    }

    userId = authUser.user?.id
    console.log(" User created:", userId)
  })
  afterAll(async () => {
    const supabaseAdmin = await getInjection("ISupabaseClientAdmin");
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId!);
  
    if (error) {
      console.error(" Failed to delete user:", error)
    } else {
      console.log("User deleted:", data)
    }
  });

  it("should create a user in supabase auth", async () => {
    expect(userId).toBeDefined()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    expect(error).toBeNull()
    expect(data.user?.email).toBe(email)

  })

  it("should insert a client row via trigger", async () => {
    const { data: clientRow, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id_user", userId)
      .single()
    console.error("Message:", clientError?.message)

    expect(clientError).toBeNull()
    expect(clientRow).toBeDefined()
    expect(clientRow.email).toBe(email)
    expect(clientRow.nom).toBe("MartinTest")
    expect(clientRow.prenom).toBe("MarieTest")
  })

  it("should insert a client_adresses row via trigger", async () => {
    const { data: addressRow, error: addressError } = await supabase
      .from("client_adresses")
      .select("*")
      .eq("nom", "MartinTest")

    console.error("Message:", addressError?.message)

    expect(addressError).toBeNull();
    expect(addressRow).not.toBeNull();
    expect(addressRow?.length).toBeGreaterThan(0);
  })
})