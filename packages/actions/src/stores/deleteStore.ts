"use server";

import { deleteStoreUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const deleteStoreAction = async (storeId: number) => {
  try {
    await deleteStoreUseCase(storeId);
  } catch (error: any) {
    throw new BadRequestError("Failed to delete a store");
  }
};
