"use server";

import { addDiscountLineUseCase } from "@repo/core/usecases";
import { BadRequestError, ReturnOne } from "@repo/core/types";
import { DiscountLine, DiscountLineInput } from "@repo/core/models";

export const addDiscountLineAction = async (discountLine: DiscountLineInput): Promise<ReturnOne<DiscountLine>> => {
  try {
    const createdDiscount = await addDiscountLineUseCase(discountLine);
    return {
      item: createdDiscount
    };
  } catch (error: any) {
    console.error("Add discount line error:", error);
    return {
      item: {} as DiscountLine,
      error: error
    }
  }
};
