import { GenericFilter } from "../../../types";
import { ReturnStatus, ReturnType, ReturnFilterType} from "../../../models";

const filterFetch: Record<ReturnFilterType, () => Promise<GenericFilter>> = {
    [ReturnFilterType.STATUS]: async () => {
        return {
            key: ReturnFilterType.STATUS,
            text: "Statut",
            values: [
                { id: ReturnStatus.PENDING, name: "En attente" },
                { id: ReturnStatus.APPROVED, name: "Approuvé" },
                { id: ReturnStatus.VALIDATED, name: "Validé" },
                { id: ReturnStatus.REJECTED, name: "Refusé" }
            ]
        }
    },
    [ReturnFilterType.TYPE]: async () => {
        return {
            key: ReturnFilterType.TYPE,
            text: "Type",
            values: [
                { id: ReturnType.REPAYMENT, name: "Remboursement" },
                { id: ReturnType.EXCHANGE, name: "Échange" },
                { id: ReturnType.CREDIT, name: "Avoir" }
            ]
        }
    }
}

export const getAdminReturnFilters = async (): Promise<GenericFilter[]> => {
    const filters = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filters;
}