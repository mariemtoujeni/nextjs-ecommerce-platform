"use server";

import { updateDiscountUseCase } from "@repo/core/usecases";
import { Discount } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";

export const updateDiscountAction = async ( discount: Partial<Discount> & { id: number } ): Promise<ReturnOne<Discount>> => {
  try {
    const updatedDiscount = await updateDiscountUseCase(discount);
    return {
      item: updatedDiscount
    };
  } catch (error: any) {
    console.error("update error:", error);
    return {
      item: {} as Discount,
      error: error
    }
  }
};
