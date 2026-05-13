import { PurchaseOrder, PurchaseOrderInput, PurchaseOrderLineInput, PurchaseOrderLine, PurchaseOrderPresenter, PurchaseOrderFilterInput, PurchaseOrderPresenterInput } from "../models";
import { ReturnAll, ReturnOne } from "../types";

export type ReadPurchaseOrderLineProps = {
    supplierId?: number;
    modelId?: number;
}

export interface IPurchaseOrderRepository {
    createPurchaseOrder(purchaseOrder: PurchaseOrderInput): Promise<PurchaseOrder>;
    readPurchaseOrderLine(props: ReadPurchaseOrderLineProps): Promise<PurchaseOrderLine | PurchaseOrderLine[]>;    
    createPurchaseOrderLine(purchaseOrderLine: PurchaseOrderLineInput): Promise<PurchaseOrderLine>;
    updatePurchaseOrderLine(purchaseOrderLine: PurchaseOrderLineInput): Promise<PurchaseOrderLine>;
    deletePurchaseOrderLine(id: number): Promise<void>;

    readPurchaseOrder(id: number): Promise<PurchaseOrderPresenter>;
    listPurchaseOrderPresenter(options?: PurchaseOrderFilterInput): Promise<ReturnAll<PurchaseOrderPresenter>>;
    listPurchaseOrderLines(id: number): Promise<ReturnAll<PurchaseOrderLine>>;
    createPurchaseOrderPresenter(purchaseOrder: PurchaseOrderPresenterInput): Promise<PurchaseOrderPresenter>;
    updatePurchaseOrder(id: number, purchaseOrder: PurchaseOrderPresenterInput): Promise<ReturnOne<PurchaseOrderPresenter>>;
    deletePurchaseOrder(id: number): Promise<void>;
}