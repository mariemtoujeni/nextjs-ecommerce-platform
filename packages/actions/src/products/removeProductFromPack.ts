"use server";

import { deleteProductFromPackUseCase } from "@repo/core/usecases";

export const deleteProductFromPackAction = async (id: number, associatedProductId: number) => {
  try {
    await deleteProductFromPackUseCase(id, associatedProductId);
  } catch (error: any) {
    console.error(error);
  }
};
