import { SupabaseClient } from "@supabase/supabase-js";
import { getInjection } from "@repo/core/types";
import {  beforeAll, describe, expect, it } from "vitest";
describe("reset password", () => {
    let supabase: SupabaseClient
    let email : string
    let link : string
    let actionLink: string | undefined;
    beforeAll(async () => {
    supabase = await getInjection("ISupabaseClientAdmin")
    email = `mariem@squaad.io`
    link = `https://dev.nataquashop.com/fr/reset-password`
     const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type:'recovery',
      email: email,
      options: { redirectTo: link}
    })
     if (authError) {
          console.error("Failed to generate link:", authError)
        }

    actionLink = authData.properties?.action_link
    console.log("link",actionLink)

})
it("should generate a reset password link", () => {
    expect(actionLink).toBeDefined();
    expect(actionLink).toContain("verify");
    expect(actionLink).toContain("token=");
  });
it("should redirect to reset-password page", () => {
  expect(actionLink).toBeDefined();
  expect(actionLink).toContain(`redirect_to=${link}`);
  });

})