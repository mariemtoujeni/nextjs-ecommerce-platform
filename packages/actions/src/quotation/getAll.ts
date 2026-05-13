"use server"

import { QuotationFilterInput } from "@repo/core/models";
import { listAllQuotationsUseCase } from "@repo/core/usecases";

export const getAllQuotationAction = async (options?: QuotationFilterInput) => {
    try 
    {
        const quotations = await listAllQuotationsUseCase(options);

        return quotations;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
}