"use server";

import { deleteQuotationLineUseCase } from "@repo/core/usecases";
import { BadRequestError } from "@repo/core/types";

export const deleteQuotationLineAction = async (QuotationLineId: number) => {
  try {
    await deleteQuotationLineUseCase(QuotationLineId);
  } catch (error: any) {
    throw new BadRequestError("Failed to delete a quotation Line");
  }
};
