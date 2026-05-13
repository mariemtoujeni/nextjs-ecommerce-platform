import { GenericFilter } from "../../types";
import { StockFilterType } from "../../models";

const filterFetch: Record<StockFilterType, () => Promise<GenericFilter>> = {
    [StockFilterType.STATUS]: async () => {
        return {
            key: StockFilterType.STATUS,
            text: "Statut",
            values: [
                { id: "DISPONIBLE", name: "Disponible" },
                { id: "INDISPONIBLE", name: "Indisponible" },
                { id: "BLOQUE", name: "Bloqué" }
            ]
        }
    },
    [StockFilterType.PUBLISHED]: async () => {
        return {
            key: StockFilterType.PUBLISHED,
            text: "Etat de publication",
            values: [
                { id: "PUBLIE", name: "Publié" },
                { id: "NON_PUBLIE", name: "Non publié" }
            ]
        }
    }
}

export const getStockFilters = async (): Promise<GenericFilter[]> => {
    const filters = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));
    return filters;
}