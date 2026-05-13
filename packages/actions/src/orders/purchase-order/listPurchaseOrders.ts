"use server"

import { PurchaseOrderFilterInput, PurchaseOrderPresenter } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listPurchaseOrderWithLinesUseCase } from "@repo/core/usecases";

export const listPurchaseOrdersAction = async (options?: PurchaseOrderFilterInput): Promise<ReturnAll<PurchaseOrderPresenter>> => {
    try {
        const purchaseOrders = await listPurchaseOrderWithLinesUseCase(options);
        return purchaseOrders;
    } catch (error: any) {
        return {
            total: 0,
            count: 0,
            items: [],
            error: error.message
        };
    }
}