import { QuotationLine, QuotationLineInput } from "../../models";
import { getInjection } from "../../types";

export const createQuotationLineUseCase = async (quotationLine: QuotationLineInput): Promise<QuotationLine> => {
    const quotationRepository = await getInjection('IQuotationRepository');

    const createdQuotationLine = await quotationRepository.addQuotationLine(quotationLine)
    return createdQuotationLine;
}