'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminProductAlertFilters } from "@repo/core/usecases";

export const getAdminFilters = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminProductAlertFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}