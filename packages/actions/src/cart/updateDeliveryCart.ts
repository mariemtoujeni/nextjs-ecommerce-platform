"use server";

import { updateDeliveryCartUseCase } from "@repo/core/usecases";
import { DeliveryCart, DeliveryCartInput } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";

export const updateDeliveryCartAction = async ( deliveryCart: Partial<DeliveryCartInput> ): Promise<ReturnOne<DeliveryCart>> => {
  try {
    const result = await updateDeliveryCartUseCase(deliveryCart);
    return {
      item: result
    };
  } catch (error: any) {
    console.error(error);
    return {
      item: {} as DeliveryCart,
      error: error
    };
  }
};
