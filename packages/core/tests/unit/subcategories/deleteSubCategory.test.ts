import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteSubCategoryUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe("deleteSubCategoryUseCase", () => {
  beforeEach(async () => {await setup()});
  afterEach(async () => {await teardown()});

  it("should delete a subcategory by ID", async () => {
    const subCategory = await deleteSubCategoryUseCase(301); 
    expect(subCategory).toBeUndefined();
  });
}); 