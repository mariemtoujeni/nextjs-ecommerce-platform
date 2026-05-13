"use server";

import { Supplier, SupplierInput } from "@repo/core/models";  
import { ReturnOne } from "@repo/core/types";
import { createSupplierUseCase } from "@repo/core/usecases";

export const createSupplierAction = async (supplier: SupplierInput): Promise<ReturnOne<Supplier>> => {
    try {
        const result = await createSupplierUseCase(supplier);
        return {
            item: result,
            error: undefined
        };
    } catch (error: any) {
        console.error(error);
        return {
            item: null as unknown as Supplier,
            error: error.message
        };
    }
}