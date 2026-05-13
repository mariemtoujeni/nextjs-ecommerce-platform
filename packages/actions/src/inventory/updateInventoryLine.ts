"use server";

import { updateInventoryLineUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { InventoryLine } from "@repo/core/models";

export const updateInventoryLineAction = async (inventoryLine: InventoryLine): Promise<InventoryLine> => {
  try {
    const result = await updateInventoryLineUseCase(inventoryLine);
    return result;
  } catch (error: any) {
    throw new BadRequestError("Failed to update inventoryLine");
  }
};
