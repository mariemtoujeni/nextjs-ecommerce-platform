"use server";

import { createInventoryLineUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { InventoryLine } from "@repo/core/models";

export const createInventoryLineAction = async (inventoryLine: InventoryLine): Promise<InventoryLine> => {
  try {
    const result = await createInventoryLineUseCase(inventoryLine);
    return result;
  } catch (error: any) {
    console.error("Add inventoryLine error:", error);
    throw new BadRequestError("Failed to add inventoryLine");
  }
};
