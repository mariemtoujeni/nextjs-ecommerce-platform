"use server"

import { getDeliveryCartUseCase } from "@repo/core/usecases";
import { DeliveryCart } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";

export const getDeliveryCartAction = async (): Promise<ReturnOne<DeliveryCart>> => {
    try {
        const deliveryCart = await getDeliveryCartUseCase();
        return {
            item: deliveryCart,
        };
    } catch (error: any) {
        return {
            item: {} as DeliveryCart,
            error: error
        };
    }
}