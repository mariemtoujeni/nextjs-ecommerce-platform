"use server"

import { getDiscountByIdUseCase } from "@repo/core/usecases";
import { Discount } from "@repo/core/models"
import { ReturnOne } from "@repo/core/types";

export const getDiscountAction = async (id: number): Promise<ReturnOne<Discount>> => {    
  try {
      const Discount = await getDiscountByIdUseCase(id);
      return {
        item: Discount
      };
    } catch (error: any) {
        return {
          item: {} as Discount, 
          error: error
        }
    }
}