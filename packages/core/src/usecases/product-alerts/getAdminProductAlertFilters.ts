import { GenericFilter, getInjection } from "../../types";
import { ProductAlertFilterTypeAdmin, ProductState } from "../../models";

const filterFetch: Record<ProductAlertFilterTypeAdmin, () => Promise<GenericFilter>> = {
    [ProductAlertFilterTypeAdmin.STATE]: async () => ({key: ProductAlertFilterTypeAdmin.STATE, text: "État"
        , values: [
            {id: 0, name: "Traité"},
            {id: 1, name: "En attente"},
        ]}),
}

export const getAdminProductAlertFilters = async (): Promise<GenericFilter[]> => {
    const filter = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filter;
}