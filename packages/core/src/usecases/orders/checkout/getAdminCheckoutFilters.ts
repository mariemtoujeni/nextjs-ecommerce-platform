import { GenericFilter } from "../../../types";
import { CheckoutFilterType } from "../../../models";

const filterFetch: Record<CheckoutFilterType, () => Promise<GenericFilter>> = {
    [CheckoutFilterType.PAYMENT_METHOD]: async () => {
        return {
            key: CheckoutFilterType.PAYMENT_METHOD,
            text: "Méthode de paiement",
            values: [
                { id: "ESPECE", name: "Espèce" },
                { id: "CARTE", name: "Carte" },
                { id: "CHEQUE", name: "Chèque" },
                { id: "MIXTE", name: "Mixte" }
            ]
        }
    },
    [CheckoutFilterType.DISCOUNT_TYPE]: async () => {
        return {
            key: CheckoutFilterType.DISCOUNT_TYPE,
            text: "Type de remise",
            values: [
                { id: "POURCENTAGE", name: "Pourcentage" },
                { id: "MONTANT", name: "Fixe" }
            ]
        }
    },
    [CheckoutFilterType.STATUS]: async () => {
        return {
            key: CheckoutFilterType.STATUS,
            text: "Statut",
            values: [
                { id: "ACTIF", name: "Ouvert" },
                { id: "FINALISE", name: "Fermé" }
            ]
        }
    }
}

export const getAdminCheckoutFilters = async (): Promise<GenericFilter[]> => {
    const filters = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filters;
}