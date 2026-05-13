import { GenericFilter } from "../../../types";
import { PurchaseOrderFilterType } from "../../../models";

const filterFetch: Record<PurchaseOrderFilterType, () => Promise<GenericFilter>> = {
    [PurchaseOrderFilterType.STATUS]: async () => {
        return {
            key: PurchaseOrderFilterType.STATUS,
            text: "Statut",
            values: [
                { id: "BROUILLON", name: "Brouillon" },
                { id: "PARTIELLE", name: "Partielle" },
                { id: "ENVOYEE", name: "Envoyée" },
                { id: "RECU", name: "Reçu" },
                { id: "ANNULEE", name: "Annulée" }
            ]
        }
    },
    [PurchaseOrderFilterType.MODE_PAIEMENT]: async () => {
        return {
            key: PurchaseOrderFilterType.MODE_PAIEMENT, 
            text: "Mode de paiement",
            values: [
                { id: "ESPECE", name: "Espèce" },
                { id: "CARTE", name: "Carte" },
                { id: "CHEQUE", name: "Chèque" },
                { id: "MIXTE", name: "Mixte" }
            ]
        }
    },
    [PurchaseOrderFilterType.VALID]: async () => {
        return {
            key: PurchaseOrderFilterType.VALID,
            text: "Validité",
            values: [
                { id: "VALID", name: "Valide" },
                { id: "INVALID", name: "Invalide" }
            ]
        }
    }
}

export const getPurchaseOrderFilters = async (): Promise<GenericFilter[]> => {
    const filters = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));
    return filters;
}