"use server";

import { addStoreUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { CreateStoreRequest } from "@repo/core/models";

export const addStoreAction = async (store: CreateStoreRequest) => {
  try {
    const result = await addStoreUseCase(store);
    return result;
  } catch (error: any) {
    console.error("Add Store error:", error);
    throw new BadRequestError("Failed to add Store");
  }
};
