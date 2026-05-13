'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminGiftCardFilters } from "@repo/core/usecases";

export const getAdminGiftCardFiltersAction = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminGiftCardFilters();
    } catch (error) {
        console.error(error);
        return [];
    }
}