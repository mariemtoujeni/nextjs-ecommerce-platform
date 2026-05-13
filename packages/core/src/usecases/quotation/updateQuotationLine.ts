import { QuotationLine } from "../../models";
import { getInjection } from "../../types";

export const updateQuotationLineUseCase = async (quotationLine: QuotationLine): Promise<QuotationLine> => {
    const quotationRepository = await getInjection('IQuotationRepository');

    const updatedQuotationLine = await quotationRepository.updateQuotationLine(quotationLine);
    return updatedQuotationLine;
}