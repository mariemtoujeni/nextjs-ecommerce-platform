'use server';

import { GenericFilter } from "@repo/core/types";
import { getPurchaseOrderFilters } from "@repo/core/usecases";

export const getAdminPurchaseOrderFilters = async (): Promise<GenericFilter[]> => {
    try {
        return await getPurchaseOrderFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}