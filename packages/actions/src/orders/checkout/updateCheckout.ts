"use server"

import { Checkout, CheckoutInput } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { updateCheckoutUseCase } from "@repo/core/usecases";

export const updateCheckoutAction = async (id: number, checkout: CheckoutInput) : Promise<ReturnOne<Checkout>> => {
    try {
        const updatedCheckout = await updateCheckoutUseCase(id, checkout);
        return {
            item: updatedCheckout,
        };
    } catch (error: any) {
        return {
            item: null as unknown as Checkout,
            error: error.message,
        };
    }
}