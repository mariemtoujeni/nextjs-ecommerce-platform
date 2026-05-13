"use server"

import { updateQuotationUseCase } from "@repo/core/usecases";
import { Quotation } from "@repo/core/models";

export const updateQuotationAction = async (quotation: Quotation) => {
    const updatedQuotation = await updateQuotationUseCase(quotation);
    return updatedQuotation;
}