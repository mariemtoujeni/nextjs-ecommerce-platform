"use server"

import { ModelFilterInput, ModelWithProduct, ReadAllModelsWithProductProps } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { listAllProductModelsUseCase } from "@repo/core/usecases";

export const getAllProductModelsAction = async (options?: ModelFilterInput) : Promise<ReturnAll<ModelWithProduct>> => {
    try 
    {
        const productModels = await listAllProductModelsUseCase({
            options: options || {},
            modelIds: [],
            brandId: undefined
        });

        return productModels;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
}

export const getAllProductModels2Action = async (props: ReadAllModelsWithProductProps) : Promise<ReturnAll<ModelWithProduct>> => {
    try 
    {
        const productModels = await listAllProductModelsUseCase({
            options: props.options,
            modelIds: props.modelIds,
            brandId: props.brandId,
            flag: props.flag
        });

        return productModels;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
}