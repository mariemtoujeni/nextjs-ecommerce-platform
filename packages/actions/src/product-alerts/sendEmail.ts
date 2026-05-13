"use server"

import { ProductAlert } from "@repo/core/models";
import { sendRetourEnStockEmailUseCase } from "@repo/core/usecases";

export const sendRetourEnStockEmailAction = async (productAlert: ProductAlert) => {
    try 
    {
        const productAlerts = await sendRetourEnStockEmailUseCase(productAlert);
        return productAlerts;
    } 
    catch (error: any) {
        throw error;
    }
}