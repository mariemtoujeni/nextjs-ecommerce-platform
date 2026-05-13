import { GenericFilter } from "../../../types";
import { GiftCardFilterType, GiftCardStatus } from "../../../models";


const filterFetch: Record<GiftCardFilterType, () => Promise<GenericFilter>> = {
    [GiftCardFilterType.STATUS]: async () => {
        return {
            key: GiftCardFilterType.STATUS,
            text: "Statut",
            values: [
                { id: GiftCardStatus.USED, name: "Utilisé" },
                { id: GiftCardStatus.NOT_USED, name: "Non utilisé" },
                { id: GiftCardStatus.EXPIRED, name: "Expiré" },
                { id: GiftCardStatus.CANCELLED, name: "Annulé" }
            ]
        }
    }
}

export const getAdminGiftCardFilters = async (): Promise<GenericFilter[]> => {
    const filters = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filters;
}