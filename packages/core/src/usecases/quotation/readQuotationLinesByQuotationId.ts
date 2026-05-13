import { QuotationLine } from "../../models";
import { getInjection, ReturnAll } from "../../types";

export const readQuotationLinesByQuotationId = async (quotationId: number): Promise<ReturnAll<QuotationLine>> => {
    const quotationRepository = await getInjection('IQuotationRepository');

    const quotationLines = await quotationRepository.findQuotationLinesByQuotationId(quotationId);
    
    return quotationLines;
}

