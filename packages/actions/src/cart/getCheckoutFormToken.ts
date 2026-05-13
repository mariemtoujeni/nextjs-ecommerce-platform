"use server"

import { FormCheckout } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { getCheckoutFormTokenUseCase } from "@repo/core/usecases";

export const getCheckoutFormTokenAction = async (): Promise<ReturnOne<FormCheckout>> => {
    try {
        const result = await getCheckoutFormTokenUseCase();
        return {
            item: result
        };
    } catch (error: any) {
        return {
            item: {} as FormCheckout,
            error: error
        };
    }
}