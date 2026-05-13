import { QuotationDiscount } from "../../models";
import { getInjection, ReturnAll } from "../../types";

export const readQuotationDiscountsByQuotationId = async (quotationId: number): Promise<ReturnAll<QuotationDiscount>> => {
    const quotationRepository = await getInjection('IQuotationRepository');

    const quotationDiscounts = await quotationRepository.findQuotationDiscountsByQuotationId(quotationId);
    
    return quotationDiscounts;
}

