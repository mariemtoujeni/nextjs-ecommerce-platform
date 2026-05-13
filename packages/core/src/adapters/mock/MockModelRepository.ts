import { Model, ModelAdmin, ModelFilterInput, ModelProductDetail, ModelUpdate, ModelWithProduct, ReadAllModelsWithProductProps } from "../../models";
import { IModelRepository } from "../../repositories";
import { NotFoundError } from "../../types/error";
import { ReturnAll } from '../../types/utils';
import { SharedMemory } from "./SharedMemory";

export class MockModelRepository implements IModelRepository {
    async readModelWithProductById(id: number): Promise<ModelWithProduct> {
        const model = SharedMemory.models.find(m => m.id === id);
        if (!model) {
            throw new NotFoundError("Model not found: " + id);
        }
        const product = SharedMemory.products.find(p => p.id === model.productId);
        if (!product) {
            throw new NotFoundError("Product not found: " + model.productId);
        }
        const attributValues = SharedMemory.model_attribut_valeurs.filter(av => av.idModel === model.id);
        const modelWithProduct: ModelWithProduct = {
            ...model,
            product,
            attributValues: attributValues.map(av => ({
                idModel: av.idModel,
                idAttributValue: av.idAttributValue,
                attributValue: SharedMemory.attribut_valeurs.find(attrVal => attrVal.id === av.attributValue.id)!
            }))
        };

        return modelWithProduct;
    }

    async readModelProductDetailById(id: number): Promise<ModelProductDetail> {
        throw new Error("Not implemented");
    }

    async readModelById(id: number): Promise<Model> {
        const model = SharedMemory.modelProduct.find(m => m.id === id);
        if(!model) {
            throw new NotFoundError("Model not found: " + id);
        }
        return model;
    }

    async readModelsByIds(ids: number[]): Promise<Model[]> {
        const models = SharedMemory.models.filter(m => ids.includes(m.id));
        if(models.length !== ids.length) {
            throw new NotFoundError("Models not found: " + ids.filter(id => !models.some(m => m.id === id)).join(', '));
        }
        return models;
    }

    async readByBarcodes(barcodes: string[]): Promise<ModelAdmin[]> {
        const models = SharedMemory.models.filter(m => barcodes.includes(m.barcode));

        return models;
    }

    async readByBarcode(barcode: string): Promise<ModelAdmin> {
        const model = SharedMemory.models.find(m => m.barcode === barcode);
        if(!model) {
            throw new NotFoundError("Model not found: " + barcode);
        }
        return model;
    }

    async bulkUpdateStock(models: ModelAdmin[]): Promise<void> {
        models.forEach(m => {
            const model = SharedMemory.models.find(mockModel => mockModel.barcode === m.barcode);
            if(model) {
                model.minStock = m.minStock;
            } else {
                throw new NotFoundError("Model not found: " + m.barcode);
            }
        });
    }

    async readAllModelsWithProduct(props: ReadAllModelsWithProductProps): Promise<ReturnAll<ModelWithProduct>> {
        const { options, modelIds, brandId } = props;
        const { limit = 50, offset = 0, sort, search, filters } = options;
        const startOffset = (offset ?? 0) * (limit ?? 50);
        const endOffset = startOffset + (limit ?? 50) - 1;


        let models = 'asc' == sort
            ? [...SharedMemory.models].sort((a, b) => a.id - b.id).slice(offset ?? 0, (offset ?? 0) + (limit ?? 10))
            : [...SharedMemory.models].sort((a, b) => b.id - a.id).slice(offset ?? 0, (offset ?? 0) + (limit ?? 10));

        if(modelIds && modelIds.length > 0) {
            models = models.filter(m => modelIds.includes(m.id));
        }

        const modelsWithProduct: ModelWithProduct[] = models.map(m => {
            const product = SharedMemory.products.find(p => p.id === m.productId);            
            if(!product) {
                throw new NotFoundError("Product not found: " + m.productId);
            }
            const attributValues = SharedMemory.model_attribut_valeurs.filter(av => av.idModel === m.id);
            
            const elem = {
                ...m,
                product: product,
                attributValues: attributValues.map(av => {
                    return {
                        idModel: av.idModel,
                        idAttributValue: av.idAttributValue,
                        attributValue: SharedMemory.attribut_valeurs.find(attrVal => attrVal.id === av.attributValue.id)!
                    }
                })
            }
            return elem;
        });

        return {
            items: modelsWithProduct,
            total: models.length,
            count: modelsWithProduct.length
        };
    } 

    async readModelsWithProductByShopId(shopId: number, options: ModelFilterInput): Promise<ReturnAll<ModelWithProduct>> {
        const { limit, offset, sort } = options;

        let models = 'asc' == sort
            ? [...SharedMemory.models].sort((a, b) => a.id - b.id).slice(offset ?? 0, (offset ?? 0) + (limit ?? 10))
            : [...SharedMemory.models].sort((a, b) => b.id - a.id).slice(offset ?? 0, (offset ?? 0) + (limit ?? 10));

        const shopLines = SharedMemory.shopLines.filter(sl => sl.idShop === shopId);
        models = models.filter(m => shopLines.some(sl => sl.idModel === m.id));

        const modelsWithProduct: ModelWithProduct[] = models.map(m => {
            const product = SharedMemory.products.find(p => p.id === m.productId);            
            if(!product) {
                throw new NotFoundError("Product not found: " + m.productId);
            }
            const attributValues = SharedMemory.model_attribut_valeurs.filter(av => av.idModel === m.id);
            
            const elem = {
                ...m,
                product: product,
                attributValues: attributValues.map(av => {
                    return {
                        idModel: av.idModel,
                        idAttributValue: av.idAttributValue,
                        attributValue: SharedMemory.attribut_valeurs.find(attrVal => attrVal.id === av.attributValue.id)!
                    }
                })
            }
            return elem;
        });

        return {
            items: modelsWithProduct,
            total: models.length,
            count: modelsWithProduct.length
        };
    }

    async create(model: Omit<ModelAdmin, "id" | "attributValeurs">): Promise<ModelAdmin> {
        const modelId = SharedMemory.models.length + 1;
        const modelAdmin: ModelAdmin = {
            ...model,
            id: modelId,
            attributValeurs: [],
        }
        SharedMemory.models.push(modelAdmin);
        return modelAdmin;
    }
    
    async createAttribute(modelId: number, attributeValueId: number): Promise<void> {
        SharedMemory.model_attribut_valeurs.push({
            idModel: modelId,
            idAttributValue: attributeValueId,
            attributValue: SharedMemory.attribut_valeurs.find(attrVal => attrVal.id === attributeValueId)!,
        });
    }

    async update(id: number, update: ModelUpdate): Promise<void> {
        const model = SharedMemory.models.find(m => m.id === id); 
        if(!model) {
            throw new NotFoundError("Model not found: " + id);
        }
        Object.assign(model, update);
    }
}