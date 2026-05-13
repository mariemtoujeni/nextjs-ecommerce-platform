import { IQuotationRepository } from "../../repositories";
import { OrderDeliveryMode, Quotation, QuotationDiscount, QuotationDiscountInput,
         QuotationFilter, QuotationInput, QuotationLine, QuotationLineInput, QuotationStatus } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { InternalServerError } from "../../types/error";
import { ReturnAll } from "../../types/utils";

export class MockQuotationRepository implements IQuotationRepository {
    
    deleteQuotationLine(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateQuotationLine(quotationLine: QuotationLine): Promise<QuotationLine> {
        throw new Error("Method not implemented.");
    }
    deleteQuotationDiscount(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateQuotationDiscount(quotationDiscount: QuotationDiscount): Promise<QuotationDiscount> {
        throw new Error("Method not implemented.");
    }

    addQuotationDiscount(quotationDiscount: QuotationDiscountInput): Promise<QuotationDiscount> {
        throw new Error("Method not implemented.");
    }

    findQuotationDiscountsByQuotationId(quotationId: number): Promise<ReturnAll<QuotationDiscount>> {
        throw new Error("Method not implemented.");
    }
    
    findQuotationLinesByQuotationId(devisId: number): Promise<ReturnAll<QuotationLine>> {
        throw new Error("Method not implemented.");
    }

    addQuotationLine(quotationLine: QuotationLineInput): Promise<QuotationLine> {
        throw new Error("Method not implemented.");
    }

    async addQuotation(quotation: QuotationInput): Promise<Quotation> {
        const id_new_quotation = Math.max(...SharedMemory.quotations.map(quotation => quotation.id)) + 1;
        const newquotation = { ...quotation, id: id_new_quotation, createdAt: new Date(), clientNumber: 89746
            , orderId: 55, clubId: 41, rest: 44, deliveryMode: OrderDeliveryMode.COLISSIMO
        };
        SharedMemory.quotations.push(newquotation);
        return newquotation;
    }

    async updateQuotation(quotation: Quotation): Promise<Quotation> {
        const index = SharedMemory.quotations.findIndex(q => q.id === quotation.id);
        SharedMemory.quotations[index] = quotation;
        return quotation;
    }
    
    async readById(id: number): Promise<Quotation> {
        const Quotation = SharedMemory.quotations.find(quotation => quotation.id === id);
        if (!Quotation) {
            throw new InternalServerError('Event not found');
        }
        return Quotation;
    }

    async read(options: QuotationFilter, status?: QuotationStatus): Promise<ReturnAll<Quotation>> {
        const { limit, offset, sort } = options;

        const filteredQuotations = status
            ? SharedMemory.quotations.filter(quotation => quotation.status === status)
            : SharedMemory.quotations;

        const sortedQuotations = sort === 'asc'
            ? [...filteredQuotations].sort((a, b) => a.id - b.id)
            : [...filteredQuotations].sort((a, b) => b.id - a.id);

        const paginatedQuotations = sortedQuotations.slice(offset, offset + limit);

        return {
            total: filteredQuotations.length,
            count: paginatedQuotations.length,
            items: paginatedQuotations,
        };
    }


}