import { GenericFilter } from "@repo/core/types";
import { InventoryFilterTypeAdmin, InventoryStatus } from "@repo/core/models";

const filterFetch: Record<InventoryFilterTypeAdmin, () => Promise<GenericFilter>> = {
    [InventoryFilterTypeAdmin.STATE]: async () => ({key: InventoryFilterTypeAdmin.STATE, text: "État"
        , values: [
            {id: InventoryStatus.ARCHIVE, name: "Archivé"},
            {id: InventoryStatus.EN_ATTENTE, name: "En attente"},
            {id: InventoryStatus.VALIDE, name: "Validé"},
        ]}),
}

export const getAdminInventoryFilters = async (): Promise<GenericFilter[]> => {
    const filter = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filter;
}