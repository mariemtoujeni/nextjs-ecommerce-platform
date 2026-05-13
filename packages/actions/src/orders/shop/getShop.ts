"use server"

import { ModelAttributValue, ModelProductDetail, ModelWithProduct, Shop, ShopLine, ShopLineWithModel, ShopPresenter, Store } from "@repo/core/models";
import { ReturnAll, ReturnOne } from "@repo/core/types";
import { getShopUseCase, listAllProductModelsByIdArrayUseCase } from "@repo/core/usecases";

export type ShopPresenterWithModels = Shop & {
    lines: ShopLineWithModel[];
}

export const getShopAction = async (id: number) : Promise<ReturnOne<ShopPresenterWithModels>> => {
    try {
        const shop = await getShopUseCase(id);

        const modelIds = shop.lines?.map((l : ShopLine) => l.idModel) || [];
        const models : ReturnAll<ModelWithProduct> = await listAllProductModelsByIdArrayUseCase(modelIds);

        const shopPresenterWithModels : ShopPresenterWithModels = {            
            id: shop.id,
            name: shop.name,
            department: shop.department,
            status: shop.status,
            expirationDate: shop.expirationDate,
            isActive: shop.isActive,
            createdAt: shop.createdAt,
            lines: shop.lines?.map((l : ShopLine) => {
                return {
                    ...l,
                    initialQuantity: l.initialQuantity,
                    soldQuantity: l.soldQuantity,
                    finalQuantity: l.finalQuantity,
                    model: {
                        name: models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.product.descriptions[0]?.title ?? '',
                        attributs: models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.attributValues.map((a : ModelAttributValue) => a.attributValue.nom) ?? [],
                        price: (models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.priceWithVat ?? 0) > 0 ? 
                            (models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.priceWithVat ?? 0) :                             
                            (models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.product.price ?? 0),
                        image: models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.product.images[0]?.url ?? '',
                        storeNames: models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.product.stores?.map((m : Store) => m.name) ?? [],
                        codeBar: models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.barcode ?? '',
                        stock: models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.stock?.disponible ?? 0,
                        minStock: models.items.find((m : ModelWithProduct) => m.id === l.idModel)?.minStock ?? 0
                    }
                }
            }) ?? []
        }

        return {
            item: shopPresenterWithModels,
        } as ReturnOne<ShopPresenterWithModels>;
    } catch (error: any) {
        return {
            item: {} as unknown as ShopPresenterWithModels,
            error: error.message,
        } as ReturnOne<ShopPresenterWithModels>;
    }
}