"use server"

import { updateQuotationDiscountUseCase } from "@repo/core/usecases";
import { QuotationDiscount } from "@repo/core/models";

export const updateQuotationDiscountAction = async (quotationDiscount: QuotationDiscount) => {
    const updatedQuotationDiscount = await updateQuotationDiscountUseCase(quotationDiscount);
    return updatedQuotationDiscount;
}