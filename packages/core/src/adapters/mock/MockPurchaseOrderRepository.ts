import { IPurchaseOrderRepository, ReadPurchaseOrderLineProps } from "../../repositories/IPurchaseOrderRepository";
import { PurchaseOrder, PurchaseOrderFilterInput, PurchaseOrderInput, PurchaseOrderInput2, 
    PurchaseOrderLine, PurchaseOrderLineInput, PurchaseOrderPresenter, PurchaseOrderPresenterInput } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { ReturnAll, ReturnOne } from "../../types";
import { BadRequestError, NotFoundError } from "../../types/error";

export class MockPurchaseOrderRepository implements IPurchaseOrderRepository {
    async createPurchaseOrder(purchaseOrder: PurchaseOrderInput): Promise<PurchaseOrder> {
        const id_new_purchaseOrder = Math.max(...SharedMemory.purchaseOrders.map(purchaseOrder => purchaseOrder.id)) + 1;
        const newpurchaseOrder = { ...purchaseOrder, id: id_new_purchaseOrder, createdAt: new Date()};
        SharedMemory.purchaseOrders.push(newpurchaseOrder);
        return newpurchaseOrder;
    }

    async readPurchaseOrderLine(props: ReadPurchaseOrderLineProps): Promise<PurchaseOrderLine | PurchaseOrderLine[]> {
        if (props.supplierId && props.modelId) {
            // get order supplier id from SharedMemory.purchaseOrder
            const filtredOrderSupplier = SharedMemory.purchaseOrders.filter(purchaseOrder => purchaseOrder.supplierId === props.supplierId);
            if (filtredOrderSupplier.length === 0) throw new NotFoundError("Order supplier not found");
            const orderSupplierIdsArray = filtredOrderSupplier.map(purchaseOrder => purchaseOrder.id);
            const purchaseOrderLine = SharedMemory.purchaseOrderLines.find(purchaseOrderLine => orderSupplierIdsArray.includes(purchaseOrderLine.orderSupplierId) && purchaseOrderLine.modelId === props.modelId);
            if (!purchaseOrderLine) throw new NotFoundError("Purchase order line not found");
            return purchaseOrderLine;
        } else if (props.supplierId) {
            // get order supplier id from SharedMemory.purchaseOrder
            const filtredOrderSupplier = SharedMemory.purchaseOrders.filter(purchaseOrder => purchaseOrder.supplierId === props.supplierId);
            if (filtredOrderSupplier.length === 0) throw new NotFoundError("Order supplier not found");
            const orderSupplierIdsArray = filtredOrderSupplier.map(purchaseOrder => purchaseOrder.id);
            const purchaseOrderLines = SharedMemory.purchaseOrderLines.filter(purchaseOrderLine => orderSupplierIdsArray.includes(purchaseOrderLine.orderSupplierId));
            if (purchaseOrderLines.length === 0) throw new NotFoundError("Purchase order lines not found");
            return purchaseOrderLines;
        } else if (props.modelId) {
            const purchaseOrderLines = SharedMemory.purchaseOrderLines.filter(purchaseOrderLine => purchaseOrderLine.modelId === props.modelId);
            if (purchaseOrderLines.length === 0) throw new NotFoundError("Purchase order lines not found");
            return purchaseOrderLines;
        } else {
            throw new BadRequestError("No supplierId or modelId provided");
        }
    }

    async listPurchaseOrderPresenter(options?: PurchaseOrderFilterInput): Promise<ReturnAll<PurchaseOrderPresenter>> {
        throw new Error("Not implemented");
    }

    async listPurchaseOrderLines(id: number): Promise<ReturnAll<PurchaseOrderLine>> {
        throw new Error("Not implemented");
    }

    async createPurchaseOrderLine(purchaseOrderLine: PurchaseOrderLineInput): Promise<PurchaseOrderLine> {
        const id_new_purchaseOrderLine = Math.max(...SharedMemory.purchaseOrderLines.map(purchaseOrderLine => purchaseOrderLine.id)) + 1;
        const newPurchaseOrderLine : PurchaseOrderLine = { 
            ...purchaseOrderLine, 
            id: id_new_purchaseOrderLine,
            validationDate: purchaseOrderLine.validationDate ?? new Date(),
            receivedQuantity: purchaseOrderLine.receivedQuantity ?? 0,
            unitHtPrice: purchaseOrderLine.unitHtPrice ?? 0,
            discount: purchaseOrderLine.discount ?? 0,
            vat: purchaseOrderLine.vat ?? 0,
            valid: purchaseOrderLine.valid ?? false,
            comment: purchaseOrderLine.comment ?? "",
            ttcPrice: purchaseOrderLine.ttcPrice ?? 0
        };
        SharedMemory.purchaseOrderLines.push(newPurchaseOrderLine);
        return newPurchaseOrderLine;
    }
    
    async updatePurchaseOrderLine(purchaseOrderLine: PurchaseOrderLineInput): Promise<PurchaseOrderLine> {
        const purchaseOrderLineToUpdate = SharedMemory.purchaseOrderLines.find(line => line.id === purchaseOrderLine.id);
        if (!purchaseOrderLineToUpdate) throw new NotFoundError("Purchase order line not found");

        const purchaseOrderLinesWithoutSearched = SharedMemory.purchaseOrderLines.filter(line => line.id !== purchaseOrderLine.id);

        const updatedPurchaseOrderLine : PurchaseOrderLine = { 
            id: purchaseOrderLineToUpdate.id,
            orderSupplierId: purchaseOrderLineToUpdate.orderSupplierId,
            modelId: purchaseOrderLineToUpdate.modelId,
            validationDate: purchaseOrderLine.validationDate ? purchaseOrderLine.validationDate : purchaseOrderLineToUpdate.validationDate ?? new Date(),
            quantity: purchaseOrderLine.quantity ? purchaseOrderLine.quantity : purchaseOrderLineToUpdate.quantity,
            receivedQuantity: purchaseOrderLine.receivedQuantity ? purchaseOrderLine.receivedQuantity : purchaseOrderLineToUpdate.receivedQuantity,
            unitHtPrice: purchaseOrderLine.unitHtPrice ? purchaseOrderLine.unitHtPrice : purchaseOrderLineToUpdate.unitHtPrice,
            discount: purchaseOrderLine.discount ? purchaseOrderLine.discount : purchaseOrderLineToUpdate.discount ?? 0,
            vat: purchaseOrderLine.vat ? purchaseOrderLine.vat : purchaseOrderLineToUpdate.vat ?? 20,
            valid: purchaseOrderLine.valid ? purchaseOrderLine.valid : purchaseOrderLineToUpdate.valid ?? false,
            comment: purchaseOrderLine.comment ? purchaseOrderLine.comment : purchaseOrderLineToUpdate.comment ?? "",
            ttcPrice: purchaseOrderLine.ttcPrice ? purchaseOrderLine.ttcPrice : purchaseOrderLineToUpdate.ttcPrice ?? 0
        };

        SharedMemory.purchaseOrderLines = [...purchaseOrderLinesWithoutSearched, updatedPurchaseOrderLine];
        return updatedPurchaseOrderLine;
    }

    async deletePurchaseOrderLine(id: number): Promise<void> {
        SharedMemory.purchaseOrderLines = SharedMemory.purchaseOrderLines.filter(purchaseOrderLine => purchaseOrderLine.id !== id);
    }

    async readPurchaseOrder(id: number): Promise<PurchaseOrderPresenter> {
        throw new Error("Not implemented");
    }

    async createPurchaseOrderPresenter(purchaseOrder: PurchaseOrderPresenterInput): Promise<PurchaseOrderPresenter> {
        const purchaseOrderInput: PurchaseOrderInput2 = {
            ...purchaseOrder,
            createdAt: purchaseOrder.createdAt ?? new Date()
        }
        const createdPurchaseOrder = await this.createPurchaseOrder(purchaseOrderInput as PurchaseOrderInput);
        const createdPurchaseOrderLines = await Promise.all(purchaseOrder.lines.map(line => this.createPurchaseOrderLine(line)));
        return {
            ...createdPurchaseOrder,
            lines: createdPurchaseOrderLines
        };
    }
    
    async updatePurchaseOrder(id: number, purchaseOrder: PurchaseOrderPresenterInput): Promise<ReturnOne<PurchaseOrderPresenter>> {
        throw new Error("Not implemented");
    }

    async deletePurchaseOrder(id: number): Promise<void> {
        throw new Error("Not implemented");
    }  
}