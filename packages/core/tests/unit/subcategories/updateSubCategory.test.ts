import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateSubCategoryUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";
import { SubCategory } from "@repo/core/models";

describe("updateSubCategoryUseCase", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

  it("should update an existing subcategory", async () => {
    const updatedSubCategory: SubCategory= {
      id: 300,
      name: "Updated SubCategory",
      active: 0,
      order: 2,
    };
    const subCategory = await updateSubCategoryUseCase(updatedSubCategory);
    expect(subCategory.id).toBe(300);
    expect(subCategory.name).toBe("Updated SubCategory");
    expect(subCategory.active).toBe(0);
    expect(subCategory.order).toBe(2);
  });
}); 