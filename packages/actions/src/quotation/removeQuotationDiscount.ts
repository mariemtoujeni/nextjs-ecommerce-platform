"use server";

import { deleteQuotationDiscountUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const deleteQuotationDiscountAction = async (QuotationDiscountId: number) => {
  try {
    await deleteQuotationDiscountUseCase(QuotationDiscountId);
  } catch (error: any) {
    throw new BadRequestError("Failed to delete a quotation discount");
  }
};
