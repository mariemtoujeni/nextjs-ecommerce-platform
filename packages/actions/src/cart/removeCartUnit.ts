"use server";

import { deleteCartUnitUseCase } from "@repo/core/usecases";

export const deleteCartUnitAction = async (modelId: number) => {
  try {
    await deleteCartUnitUseCase(modelId);
  } catch (error: any) {
    console.error(error);
  }
};
