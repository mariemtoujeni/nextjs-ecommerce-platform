"use server";

import { getSubCategoryByIdUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const getSubCategoryAction = async (id: number = 1) => {
  try {
    const result = await getSubCategoryByIdUseCase(id);
    return result;
  } catch (error: any) {
    return null;
  }
};
