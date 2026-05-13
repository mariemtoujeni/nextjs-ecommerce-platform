import { GenericFilter, getFrenchDepartmentName } from "../../../types";
import { Department, ShopFilterType, ShopStatus } from "../../../models";

const filterFetch: Record<ShopFilterType, () => Promise<GenericFilter>> = {
    [ShopFilterType.STATUS]: async () => {
        return {
            key: ShopFilterType.STATUS,
            text: "Statut",
            values: [
                { id: ShopStatus.OPEN, name: "Actif" },
                { id: ShopStatus.CLOSED, name: "Clôturé" },
                { id: ShopStatus.DRAFT, name: "Brouillon" },
                { id: ShopStatus.FINALISED, name: "Finalisé" }
            ]
        }
    },
    [ShopFilterType.DEPARTMENT]: async () => {
        return {
            key: ShopFilterType.DEPARTMENT,
            text: "Département",
            values: Object.values(Department).map(department => ({ id: department, name: getFrenchDepartmentName(parseInt(department)) })),
        }
    }
}

export const getAdminShopFilters = async (): Promise<GenericFilter[]> => {
    const filters = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filters;
}