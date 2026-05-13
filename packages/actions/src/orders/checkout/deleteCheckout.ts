"use server"

import { deleteCheckoutUseCase } from "@repo/core/usecases";
import { ReturnOne } from "@repo/core/types";

export const deleteCheckoutAction = async (id: number) : Promise<ReturnOne<void>> => {
    try {
        await deleteCheckoutUseCase(id);
        return {
            item: null as unknown as void,
            error: undefined,
        };
    } catch (error: any) {
        return {
            item: null as unknown as void,
            error: error.message,
        };
    }
}