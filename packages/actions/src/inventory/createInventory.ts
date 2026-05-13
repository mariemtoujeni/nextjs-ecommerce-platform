"use server";

import { createInventoryUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { Inventory, InventoryInput } from "@repo/core/models";

export const createInventoryAction = async (inventory: InventoryInput): Promise<Inventory> => {
  try {
    const result = await createInventoryUseCase(inventory);
    return result;
  } catch (error: any) {
    console.error("Add inventory error:", error);
    throw new BadRequestError("Failed to add inventory");
  }
};
