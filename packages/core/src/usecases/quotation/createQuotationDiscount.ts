import { QuotationDiscount, QuotationDiscountInput } from "../../models";
import { getInjection } from "../../types";

export const createQuotationDiscountUseCase = async (quotationDiscount: QuotationDiscountInput): Promise<QuotationDiscount> => {
    const quotationRepository = await getInjection('IQuotationRepository');

    const createdQuotationDiscount = await quotationRepository.addQuotationDiscount(quotationDiscount)
    return createdQuotationDiscount;
}