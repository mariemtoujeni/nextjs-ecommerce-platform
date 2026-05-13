"use server";

import { addCategoryUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { CreateCategoryRequest } from "@repo/core/models";

export const addCategoryAction = async (category: CreateCategoryRequest) => {
  try {
    const result = await addCategoryUseCase(category);
    return result;
  } catch (error: any) {
    console.error("Add category error:", error);
    throw new BadRequestError("Failed to add category");
  }
};
