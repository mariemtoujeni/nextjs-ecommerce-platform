"use server";

import { updateDiscountLineUseCase } from "@repo/core/usecases";
import { DiscountLine } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";

export const updateDiscountLineAction = async ( discountLine: Partial<DiscountLine> & { id: number } ): Promise<ReturnOne<DiscountLine>> => {
  try {
    const updatedDiscountLine = await updateDiscountLineUseCase(discountLine);
    return {
      item: updatedDiscountLine
    };
  } catch (error: any) {
    console.error("update error:", error);
    return {
      item: {} as DiscountLine,
      error: error
    };
  }
};
