"use server";

import { updateInventoryUseCase } from "@repo/core/usecases";
import { BadRequestError, ReturnOne } from "@repo/core/types";
import { Inventory } from "@repo/core/models";

export const updateInventoryAction = async (inventory: Inventory): Promise<ReturnOne<Inventory>> => {
  try {
    const result = await updateInventoryUseCase(inventory);
    return {
      item: result
    };
  } catch (error: any) {
    return {
      item: {} as Inventory,
      error: error
    };
  }
};
