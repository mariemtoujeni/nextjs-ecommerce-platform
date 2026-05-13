import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteEventUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { getInjection } from "../../../src/types/di";

describe("deleteEventUseCase", () => {
  beforeEach(setup);

  afterEach(teardown);

  it("should delete an event", async () => {
    const authService = await getInjection("IAuthenticationService");
    await authService.signIn("admin@admin.com", "admin");
    const event = await deleteEventUseCase(1); 
    expect(event).toBeUndefined();
    await authService.signOut();
  });

});
