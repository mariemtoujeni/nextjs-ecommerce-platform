"use server"

import { DiscountCart } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { getDiscountCartUseCase } from "@repo/core/usecases";


export const getUserCartDiscountAction = async (): Promise<ReturnAll<DiscountCart>> => {
  try {
      const discount = await getDiscountCartUseCase();
      return {
        items: discount,
        total: discount.length,
        count: discount.length
      };
    } catch (error: any) {
        return {
          items: [],
          total: 0,
          count: 0,     
          error: error     
        };
    }
};
