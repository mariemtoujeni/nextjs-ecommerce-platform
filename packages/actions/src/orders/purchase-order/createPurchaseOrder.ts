"use server"

import { PurchaseOrder, PurchaseOrderInput, PurchaseOrderPresenter, PurchaseOrderPresenterInput } from "@repo/core/models";
import { createPurchaseOrderUseCase, createPurchaseOrderWithLinesUseCase } from "@repo/core/usecases";
import { ReturnOne } from "@repo/core/types";

export const createPurchaseOrderAction = async (purchaseOrderToCreate: PurchaseOrderInput) : Promise<PurchaseOrder> => {
    try {
        const purchaseOrder = await createPurchaseOrderUseCase(purchaseOrderToCreate);
        return purchaseOrder;
    } catch (error: any) {
        throw error;
    }
}

export const createPurchaseOrderWithLinesAction = async (purchaseOrderToCreate: PurchaseOrderPresenterInput) : Promise<ReturnOne<PurchaseOrderPresenter>> => {
    try {
        const purchaseOrder = await createPurchaseOrderWithLinesUseCase(purchaseOrderToCreate);
        return {
            item: purchaseOrder,
        };
    } catch (error: any) {
        return {
            item: null as unknown as PurchaseOrderPresenter,
            error: error.message,
        };
    }
}