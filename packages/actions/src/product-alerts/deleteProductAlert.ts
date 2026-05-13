"use server";

import { deleteProductAlertUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const deleteProductAlertAction = async (productAlertId: number) => {
  try {
    await deleteProductAlertUseCase(productAlertId);
  } catch (error: any) {
    throw new BadRequestError("Failed to delete a ProductAlert");
  }
};
