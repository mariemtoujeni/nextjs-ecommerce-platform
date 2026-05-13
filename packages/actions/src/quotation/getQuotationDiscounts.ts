"use server"

import { readQuotationDiscountsByQuotationId } from "@repo/core/usecases";

export const getQuotationDiscountsAction = async (quotationId: number) => {
    try 
    {
        const quotationDiscounts = await readQuotationDiscountsByQuotationId(quotationId);
        
        return quotationDiscounts;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
}