"use server";

import { updateSubCategoryUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { SubCategory } from "@repo/core/models";

export const updateSubCategoryAction = async (subCategory: SubCategory) => {
  try {
    const result = await updateSubCategoryUseCase(subCategory);
    return result;
  } catch (error: any) {
    throw new BadRequestError("Failed to update category");
  }
};
