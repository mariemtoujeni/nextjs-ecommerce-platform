"use server"

import { ModelProductDetail } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { readModelProductDetailByIdUseCase } from "@repo/core/usecases";

export const getModelProductDetailByIdAction = async (id: number): Promise<ReturnOne<ModelProductDetail>> => {
    try {
        const modelProductDetail = await readModelProductDetailByIdUseCase(id);
        return {
            item: modelProductDetail,
            error: undefined
        };
    } catch (error: any) {
        console.error(error);
        return {
            item: null as unknown as ModelProductDetail,
            error: error.message
        };
    }
}