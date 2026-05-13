"use server"

import { readQuotationLinesByQuotationId } from "@repo/core/usecases";

export const getQuotationLinesAction = async (quotationId: number) => {
    try 
    {
        const quotationLines = await readQuotationLinesByQuotationId(quotationId);
        
        return quotationLines;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
}