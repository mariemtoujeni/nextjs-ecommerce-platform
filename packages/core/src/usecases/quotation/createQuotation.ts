import { Quotation, QuotationInput } from "../../models";
import { getInjection } from "../../types";

export const createQuotationUseCase = async (quotation: QuotationInput): Promise<Quotation> => {
    const quotationRepository = await getInjection('IQuotationRepository');

    const createdQuotation = await quotationRepository.addQuotation(quotation)
    return createdQuotation;
}