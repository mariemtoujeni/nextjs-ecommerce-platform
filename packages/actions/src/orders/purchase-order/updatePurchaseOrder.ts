"use server"

import { PurchaseOrderPresenter, PurchaseOrderPresenterInput, PurchaseOrderStatus, Stock } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { listStockByIdsUseCase, updatePurchaseOrderWithLinesUseCase, updateStockUseCase } from "@repo/core/usecases";

export const updatePurchaseOrderAction = async (id: number, purchaseOrderToUpdate: PurchaseOrderPresenterInput, previousPurchaseOrder?: PurchaseOrderPresenter) : Promise<ReturnOne<PurchaseOrderPresenter>> => {
    try {
        const purchaseOrder = await updatePurchaseOrderWithLinesUseCase(id, purchaseOrderToUpdate);
        if((purchaseOrder.item.status === PurchaseOrderStatus.PARTIELLE || purchaseOrder.item.status === PurchaseOrderStatus.RECU) && previousPurchaseOrder) {
            // Get Stocks
            const stocksToUpdate = await listStockByIdsUseCase(previousPurchaseOrder.lines.map((line : any) => line.modelId));
            // Update stocks according to the previousPurchaseOrder and the new purchaseOrder
            const StockList : Stock[] = [];
            for(const prevPurchaseOrderLine of previousPurchaseOrder.lines) {
                const newPurchaseOrderLine = purchaseOrder.item.lines.find((l : any) => l.modelId === prevPurchaseOrderLine.modelId);
                const stockToUpdate = stocksToUpdate.items.find((s : any) => s.idModel === prevPurchaseOrderLine.modelId);
                if(newPurchaseOrderLine && stockToUpdate) {
                    StockList.push({
                        idModel: stockToUpdate.idModel,
                        disponible: stockToUpdate.disponible + newPurchaseOrderLine.receivedQuantity - prevPurchaseOrderLine.receivedQuantity,
                        locked: stockToUpdate.locked,
                        indisponible: stockToUpdate.indisponible,
                        updatedAt: stockToUpdate.updatedAt
                    });
                }
            }
            // Update stocks
            await updateStockUseCase(StockList);
        }
        return purchaseOrder;
    } catch (error: any) {
        return {
            error: error.message,
            item: {} as PurchaseOrderPresenter
        }
    }
}