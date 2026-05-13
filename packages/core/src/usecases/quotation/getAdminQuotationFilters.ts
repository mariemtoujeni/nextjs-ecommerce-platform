import { GenericFilter } from "../../types";
import { QuotationFilterTypeAdmin, QuotationStatus } from "../../models";

const filterFetch: Record<QuotationFilterTypeAdmin, () => Promise<GenericFilter>> = {
    [QuotationFilterTypeAdmin.STATE]: async () => ({key: QuotationFilterTypeAdmin.STATE, text: "État"
        , values: [
            {id: QuotationStatus.ARCHIVE, name: "Archivé"},
            {id: QuotationStatus.EN_ATTENTE, name: "En attente"},
            {id: QuotationStatus.VALIDE, name: "Validé"},
        ]}),
}

export const getAdminQuotationFilters = async (): Promise<GenericFilter[]> => {
    const filter = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filter;
}