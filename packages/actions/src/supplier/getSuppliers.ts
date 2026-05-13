"use server";

import { Supplier, SupplierFilterInput } from "@repo/core/models";  
import { ReturnAll } from "@repo/core/types";
import { getSuppliersUsecase } from "@repo/core/usecases";

export const getSuppliersAction = async (options?: SupplierFilterInput): Promise<ReturnAll<Supplier>> => {
    try {
        const suppliers = await getSuppliersUsecase();

        return suppliers;
    } catch (error: any) {
        console.error(error);
        return {
            items: [],
            total: 0,
            count: 0,
            error: error.message
        };
    }
}