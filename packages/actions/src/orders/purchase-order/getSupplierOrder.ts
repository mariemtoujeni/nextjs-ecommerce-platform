"use server"

import { PurchaseOrderPresenter } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { getPurchaseOrderUseCase } from "@repo/core/usecases";

export const getSupplierOrderAction = async (id: string): Promise<ReturnOne<PurchaseOrderPresenter>> => {
    try {
        const purchaseOrder = await getPurchaseOrderUseCase(id);
        return purchaseOrder;
    } catch (error: any) {
        return {
            item: null as any,
            error: error.message
        };
    }
}