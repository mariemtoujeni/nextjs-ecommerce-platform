"use server";

import { createQuotationUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { QuotationInput } from "@repo/core/models";

export const addQuotationAction = async (quotation: QuotationInput) => {
  try {
    const createdQuotation = await createQuotationUseCase(quotation);
    return createdQuotation;
  } catch (error: any) {
    console.error("Add quotation error:", error);
    throw new BadRequestError("Failed to add quotation");
  }
};
