"use server";

import { createQuotationLineUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";
import { QuotationLineInput } from "@repo/core/models";

export const addQuotationLineAction = async (quotationLine: QuotationLineInput) => {
  try {
    const createdQuotationLine = await createQuotationLineUseCase(quotationLine);
    return createdQuotationLine;
  } catch (error: any) {
    console.error("Add quotation Line error:", error);
    throw new BadRequestError("Failed to add quotation Line");
  }
};
