import { Quotation } from "../../models";
import { getInjection } from "../../types";

export const getQuotationByIdUseCase = async (id: number): Promise<Quotation> => {
    const quotationRepository = await getInjection('IQuotationRepository');

    const quotations = await quotationRepository.readById(id);

    return quotations;
}