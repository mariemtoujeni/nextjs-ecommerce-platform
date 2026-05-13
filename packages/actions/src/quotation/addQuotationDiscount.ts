"use server";

import { createQuotationDiscountUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { QuotationDiscountInput } from "@repo/core/models";

export const addQuotationDiscountAction = async (quotationDiscount: QuotationDiscountInput) => {
  try {
    const createdQuotationDiscount = await createQuotationDiscountUseCase(quotationDiscount);
    return createdQuotationDiscount;
  } catch (error: any) {
    console.error("Add quotation discount error:", error);
    throw new BadRequestError("Failed to add quotation discount");
  }
};
