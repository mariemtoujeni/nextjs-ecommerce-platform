'use server';

import { getAdminReturnFilters } from "@repo/core/usecases";

export const getAdminReturnFiltersAction = async () => {
    try {
        return await getAdminReturnFilters();
    } catch (error) {
        console.error(error);
        return [];
    }
}