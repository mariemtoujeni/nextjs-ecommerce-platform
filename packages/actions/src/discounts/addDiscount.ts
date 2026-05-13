"use server";

import { addDiscountUseCase } from "@repo/core/usecases";
import { BadRequestError, ReturnOne } from "@repo/core/types";
import { Discount, DiscountCombination, ProductShop } from "@repo/core/models";

export const addDiscountAction = async (type: DiscountCombination, productShop?: ProductShop): Promise<ReturnOne<Discount>> => {
  try {
    const createdDiscount = await addDiscountUseCase(type, productShop);
    return {
      item: createdDiscount
    };
  } catch (error: any) {
    console.error("Add discount error:", error);
    return {
      item: {} as Discount,
      error: error
    };
  }
};
