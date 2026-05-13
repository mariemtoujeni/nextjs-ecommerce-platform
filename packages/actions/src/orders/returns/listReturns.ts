"use server"

import { ReturnFilterInput, ReturnPresenter } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listAllReturnsUseCase } from "@repo/core/usecases";

export const listReturnsAction = async (options?: ReturnFilterInput) : Promise<ReturnAll<ReturnPresenter>> => {
    try {
        const returns = await listAllReturnsUseCase(options);
        return returns;
    } catch (error: any) {
        return {
            items: [] as unknown as ReturnPresenter[],
            total: 0,
            count: 0,
            error: error.message,
        };
    }
}