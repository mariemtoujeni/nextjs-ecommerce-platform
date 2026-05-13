import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateStoreUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { Store } from "../../../src/models";

describe("updateStoreUseCase", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

  it("should update an existing store", async () => {
    const updatedStore: Store = {
      id: 600,
      name: "Updated Store",
      active: 0,
      order: 1,
    };

    const store = await updateStoreUseCase(updatedStore);
    expect(store.id).toBe(600);
    expect(store.name).toBe("Updated Store");
    expect(store.active).toBe(0);
  });
});
