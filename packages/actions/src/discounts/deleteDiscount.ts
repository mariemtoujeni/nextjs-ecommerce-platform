"use server";

import { deleteDiscountUseCase } from "@repo/core/usecases";

export const deleteDiscountAction = async (discountId: number): Promise<void> => {
  try {
    await deleteDiscountUseCase(discountId);
  } catch (error: any) {
    console.error(error);
  }
};
