"use server";

import { deleteSubCategoryUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const deleteSubCategoryAction = async (subCategoryId: number) => {
  try {
    await deleteSubCategoryUseCase(subCategoryId);
  } catch (error: any) {
    throw new BadRequestError("Failed to delete a subcategory");
  }
};
