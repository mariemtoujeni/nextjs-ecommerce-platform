"use server";
import { OrderFilterInput } from "@repo/core/models";
import { listAllOrdersUseCase } from "@repo/core/usecases";

export const listAllOrdersActions = async (options: OrderFilterInput) => {
    try {
        const orders = await listAllOrdersUseCase(options);
        return orders;
    } catch (error: any) {
        console.error(error);
        return { total: 0, items: [], count: 0, error: error.message };
    }
}