"use server";

import { getCategoryByIdUseCase } from "@repo/core/usecases";

export const getCategoryAction = async (id: number) => {
  try {
    const result = await getCategoryByIdUseCase(id);
    return result;
  } catch (error: any) {
    return null;
  }
};
