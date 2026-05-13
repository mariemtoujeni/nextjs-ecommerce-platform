import { Quotation, QuotationFilterInput, quotationOptionsSchema, QuotationStatus } from "../../models";
import { BadRequestError, ReturnAll, getInjection } from "../../types";


export const listAllQuotationsUseCase = async (options?: QuotationFilterInput): Promise<ReturnAll<Quotation>> => {

    const validatedOptions = quotationOptionsSchema.safeParse(options || {});

    if(!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const quotationRepository = await getInjection('IQuotationRepository');

    const Quotations = await quotationRepository.read(validatedOptions.data);
    return Quotations;
}