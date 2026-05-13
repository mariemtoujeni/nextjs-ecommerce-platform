import { ReturnAll } from "../types";
import { Model, ModelAdmin, ModelFilterInput, ModelProductDetail, ModelUpdate, ModelWithProduct, ReadAllModelsWithProductProps } from "../models";

export interface IModelRepository {
    create(model: Omit<ModelAdmin, "id" | "attributValeurs" | "attributValues">): Promise<ModelAdmin>;
    createAttribute(modelId: number, attributeValueId: number): Promise<void>;

    readByBarcodes(barcodes: string[]): Promise<ModelAdmin[]>;
    readByBarcode(barcode: string): Promise<ModelAdmin>;
    bulkUpdateStock(models: ModelAdmin[]): Promise<void>;
    readAllModelsWithProduct(props: ReadAllModelsWithProductProps): Promise<ReturnAll<ModelWithProduct>>;
    readModelsWithProductByShopId(shopId: number, options: ModelFilterInput): Promise<ReturnAll<ModelWithProduct>>;
    readModelById(id: number): Promise<Model>;
    readModelsByIds(ids: number[]): Promise<Model[]>;
    readModelWithProductById(id: number): Promise<ModelWithProduct>;
    readModelProductDetailById(id: number): Promise<ModelProductDetail>;
    update(id: number, update: ModelUpdate): Promise<void>;
}