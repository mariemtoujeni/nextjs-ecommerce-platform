"use server";

import { deleteInventoryLineUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const deleteInventoryLineAction = async (inventoryId: number, modelId: number) => {
  try {
    await deleteInventoryLineUseCase(inventoryId, modelId);
  } catch (error: any) {
    throw new BadRequestError("Failed to delete a inventory line");
  }
};
