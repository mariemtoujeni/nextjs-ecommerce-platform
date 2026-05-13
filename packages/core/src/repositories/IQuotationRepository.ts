import { Quotation, QuotationDiscount, QuotationDiscountInput, QuotationFilter, 
         QuotationInput, QuotationLine, QuotationLineInput, QuotationStatus } from "../models";
import { ReturnAll } from "../types";

export interface IQuotationRepository {
    read(options: QuotationFilter): Promise<ReturnAll<Quotation>>;
    readById(id: number): Promise<Quotation>;
    addQuotation(quotation: QuotationInput): Promise<Quotation>;
    updateQuotation(quotation: Quotation): Promise<Quotation>;

    addQuotationLine(quotationLine: QuotationLineInput): Promise<QuotationLine>;
    findQuotationLinesByQuotationId(quotationId: number): Promise<ReturnAll<QuotationLine>>;
    deleteQuotationLine(id: number): Promise<void>;
    updateQuotationLine(quotationLine: QuotationLine): Promise<QuotationLine>;
    
    addQuotationDiscount(quotationDiscount: QuotationDiscountInput): Promise<QuotationDiscount>;
    findQuotationDiscountsByQuotationId(quotationId: number): Promise<ReturnAll<QuotationDiscount>>;
    deleteQuotationDiscount(id: number): Promise<void>;
    updateQuotationDiscount(quotationDiscount: QuotationDiscount): Promise<QuotationDiscount>;
}

