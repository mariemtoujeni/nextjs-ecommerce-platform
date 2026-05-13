"use server"

import { CheckoutPresenter } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { getCheckoutUseCase } from "@repo/core/usecases";

export const getCheckoutAction = async (id: number) : Promise<ReturnOne<CheckoutPresenter>> => {
    try {
        const checkout = await getCheckoutUseCase(id);
        return {
            item: checkout,
        };
    } catch (error: any) {
        return {
            item: null as unknown as CheckoutPresenter,
            error: error.message,
        };
    }
}