"use server";


import { BadRequestError } from "@repo/core/types";
import { deleteDiscountLineUseCase } from "@repo/core/usecases";

export const deleteDiscountLineAction = async (id: number): Promise<void> => {
  try {
    await deleteDiscountLineUseCase(id);
  } catch (error: any) {
    console.error(error);
  }
};
