import { Quotation } from "../../models";
import { getInjection } from "../../types";

export const updateQuotationUseCase = async (quotation: Quotation): Promise<Quotation> => {
    const quotationRepository = await getInjection('IQuotationRepository');

    const updatedQuotation = await quotationRepository.updateQuotation(quotation);
    return updatedQuotation;
}