"use server"

import { ProductAlertFilterInput } from "@repo/core/models";
import { listAllProductAlertsUseCase } from "@repo/core/usecases";

export const getAllProductAlertsAction = async (options?: ProductAlertFilterInput) => {
    try 
    {
        const productAlerts = await listAllProductAlertsUseCase(options);

        return productAlerts;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
}