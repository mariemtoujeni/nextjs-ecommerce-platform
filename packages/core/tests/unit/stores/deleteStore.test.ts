import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteStoreUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";


describe("deleteStoreUseCase", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

  it("should delete a store by ID", async () => {
    const store = await deleteStoreUseCase(601); 
    expect(store).toBeUndefined();
  });
});
