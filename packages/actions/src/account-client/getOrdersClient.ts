"use server"

import { Order } from "@repo/core/models"
import { ReturnAll } from "@repo/core/types";
import { getClientOrdersUseCase } from "@repo/core/usecases";

export const getOrdersClientAction = async():Promise<ReturnAll<Order>>=>{
    try {
    const orders = await getClientOrdersUseCase();
    return {
        items: orders,
        count: orders.length,
        total: orders.length,
    }

} catch (error: any) {
    console.error("Error fetching client orders:", error);
    return {
        items: [],
        count: 0,
        total: 0,
        error: error
    }
}
}