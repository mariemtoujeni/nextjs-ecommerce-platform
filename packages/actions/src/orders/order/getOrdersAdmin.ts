'use server';

import { OrderFilterInput, OrderPresenter } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listOrdersUseCase } from "@repo/core/usecases";

export const getOrdersAdminAction = async (options?: OrderFilterInput): Promise<ReturnAll<OrderPresenter>> => {
    try {
        const orders = await listOrdersUseCase(options);
        return orders;
    } catch (error) {
        console.error(error);
        return {
            items: [],
            total: 0,
            count: 0
        }
    }
}