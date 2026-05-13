"use server"

import { ReturnOne } from "@repo/core/types";
import { getCollectionByIdUseCase, CollectionDetail } from "@repo/core/usecases";

export const getCollectionAction = async (id: number) : Promise<ReturnOne<CollectionDetail>> => {
    try {
        const collection = await getCollectionByIdUseCase(id);
        return {
            item: collection,
        };
    } catch (error: any) {
        return {
            error: error.message,
            item: null as unknown as CollectionDetail,
        };
    }
}