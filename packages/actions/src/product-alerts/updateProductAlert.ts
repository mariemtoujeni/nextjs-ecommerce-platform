"use server"

import { updateProductAlertUseCase } from "@repo/core/usecases";
import { ProductAlert } from "@repo/core/models";

export const updateProductAlertAction = async (productAlert: ProductAlert) => {
    const updatedProductAlert = await updateProductAlertUseCase(productAlert);
    return updatedProductAlert;
}