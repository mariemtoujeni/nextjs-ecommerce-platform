"use server";

import { updateCategoryUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { Category } from "@repo/core/models";

export const updateCategoryAction = async (category: Category) => {
  try {
    const result = await updateCategoryUseCase(category);
    return result;
  } catch (error: any) {
    throw new BadRequestError("Failed to update category");
  }
};
