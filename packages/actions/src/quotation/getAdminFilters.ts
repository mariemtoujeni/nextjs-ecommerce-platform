"use server";
'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminQuotationFilters } from "@repo/core/usecases";

export const getAdminQuotationFiltersAction = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminQuotationFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}