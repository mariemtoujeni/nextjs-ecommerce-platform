"use server";

import { deleteCategoryUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const deleteCategoryAction = async (categoryId: number) => {
  try {
    await deleteCategoryUseCase(categoryId);
  } catch (error: any) {
    throw new BadRequestError("Failed to delete a category");
  }
};
