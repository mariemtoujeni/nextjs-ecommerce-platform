"use server"

import { Checkout, CreateCheckoutRequest } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { createCheckoutUseCase } from "@repo/core/usecases";

export const createCheckoutAction = async (checkoutToCreate: CreateCheckoutRequest) : Promise<ReturnOne<Checkout>> => {
    try {
        const checkout = await createCheckoutUseCase(checkoutToCreate);
        return {
            item: checkout,
        };
    } catch (error: any) {
        return {
            item: null as unknown as Checkout,
            error: error.message,
        };
    }
}