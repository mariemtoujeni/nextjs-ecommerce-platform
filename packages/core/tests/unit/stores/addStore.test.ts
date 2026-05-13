import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addStoreUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe("addStoreUseCase", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

  it("should add a store", async () => {
    const store = await addStoreUseCase({
      name: "Store D",
      active: 1,
      order: 3,
    });
    expect(store.name).toBe("Store D");
    expect(store.active).toBe(1);
    expect(store.order).toBe(3);
  });
});
