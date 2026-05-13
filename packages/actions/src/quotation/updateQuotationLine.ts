"use server"

import { updateQuotationLineUseCase } from "@repo/core/usecases";
import { QuotationLine } from "@repo/core/models";

export const updateQuotationLineAction = async (quotationLine: QuotationLine) => {
    const updatedQuotationLine = await updateQuotationLineUseCase(quotationLine);
    return updatedQuotationLine;
}