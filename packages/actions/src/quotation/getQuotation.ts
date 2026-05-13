"use server"

import { getQuotationByIdUseCase } from "@repo/core/usecases";
import { Quotation } from "@repo/core/models"

export const getQuotationAction = async (id: number): Promise<Quotation> => {    
    const quotation = await getQuotationByIdUseCase(id);
    return quotation;
}