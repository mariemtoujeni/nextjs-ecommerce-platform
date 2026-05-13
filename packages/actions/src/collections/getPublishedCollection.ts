"use server"

import { ReturnOne } from "@repo/core/types"
import { Collections, getPublishedCollectionUseCase } from "@repo/core/usecases"

export const getPublishedCollectionAction = async (id: number) : Promise<ReturnOne<Collections>> => {
     try {
            const collection = await getPublishedCollectionUseCase(id);
            return {
                item: collection,
            };
        } catch (error: any) {
            return {
                error: error.message,
                item: null as unknown as Collections,
            };
        }

}