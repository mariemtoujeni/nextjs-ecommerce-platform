import { QuotationDiscount } from "../../models";
import { getInjection } from "../../types";

export const updateQuotationDiscountUseCase = async (quotationDiscount: QuotationDiscount): Promise<QuotationDiscount> => {
    const quotationRepository = await getInjection('IQuotationRepository');

    const updatedQuotationDiscount = await quotationRepository.updateQuotationDiscount(quotationDiscount);
    return updatedQuotationDiscount;
}