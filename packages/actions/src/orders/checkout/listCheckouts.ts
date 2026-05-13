"use server"

import { CheckoutFilterInput, CheckoutPresenter } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listAllCheckoutsUseCase } from "@repo/core/usecases";

export const listCheckoutsAction = async (options?: CheckoutFilterInput) : Promise<ReturnAll<CheckoutPresenter>> => {
    try {
        const checkouts = await listAllCheckoutsUseCase(options);
        return checkouts;
    } catch (error: any) {
        return {
            items: [] as unknown as CheckoutPresenter[],
            total: 0,
            count: 0,
            error: error.message,
        };
    }
}