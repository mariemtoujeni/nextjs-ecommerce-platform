import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addSubCategoryUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe("addSubCategoryUseCase", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

  it("should add a new subcategory", async () => {
    const subCategory = await addSubCategoryUseCase({
      name: "SubCatC",
      active: 1,
      order: 3,
    });
    expect(subCategory.name).toBe("SubCatC");
    expect(subCategory.active).toBe(1);
    expect(subCategory.order).toBe(3);
  });
}); 