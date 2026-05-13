"use server";

import { addSubCategoryUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { CreateSubCategoryRequest } from "@repo/core/models";

export const addSubCategoryAction = async (subCategory: CreateSubCategoryRequest) => {
  try {
    const result = await addSubCategoryUseCase(subCategory);
    return result;
  } catch (error: any) {
    console.error("Add subcategory error:", error);
    throw new BadRequestError("Failed to add subcategory");
  }
};
