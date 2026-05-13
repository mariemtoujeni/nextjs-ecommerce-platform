"use server";

import { getStoreByIdUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const getStoreAction = async (id: number) => {
  try {
    const result = await getStoreByIdUseCase(id);
    return result;

  } catch (error: any) {
    return null;
  }
};
