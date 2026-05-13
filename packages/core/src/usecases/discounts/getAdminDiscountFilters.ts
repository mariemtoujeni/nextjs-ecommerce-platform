import { getInjection } from "../../types/di";
import { DiscountFilterTypeAdmin, DiscountState, TypeDiscount } from "../../models/Discount";
import { GenericFilter } from "../../types/utils";

const filterFetch: Record<DiscountFilterTypeAdmin, () => Promise<GenericFilter>> = {
    [DiscountFilterTypeAdmin.TYPE]: async () => ({key: DiscountFilterTypeAdmin.TYPE, text: "Type"
        , values: [
            {id: TypeDiscount.CLUB, name: "Club"},
            {id: TypeDiscount.ADHERENT_CLUB, name: "Adhérent du club"},
            {id: TypeDiscount.AVOIR, name: "Avoir"},
            {id: TypeDiscount.CAMPAGNE, name: "Campagne"},
            {id: TypeDiscount.CHEQUE_CADEAU, name: "Chèque cadeau"},
            {id: TypeDiscount.EXPEDITION, name: "Expédition"},
            {id: TypeDiscount.CODE_PROMO, name: "Code promo"},
            {id: TypeDiscount.COMMANDE, name: "Commande"},
            {id: TypeDiscount.X_POUR_Y, name: "X pour le prix de Y"},
        ]}),
    [DiscountFilterTypeAdmin.STATE]: async () => ({key: DiscountFilterTypeAdmin.STATE, text: "État"
        , values: [
            {id: DiscountState.ACTIVE, name: "Actif"},
            {id: DiscountState.INACTIVE, name: "Inactif"},
        ]}),
}

export const getAdminDiscountFilters = async (): Promise<GenericFilter[]> => {
    const filter = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filter;
}