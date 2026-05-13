"use server";

import { updateStoreUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { Store } from "@repo/core/models";

export const updateStoreAction = async (store: Store) => {
  try {
    const result = await updateStoreUseCase(store);
    return result;
  } catch (error: any) {
    throw new BadRequestError("Failed to update Store");
  }
};
