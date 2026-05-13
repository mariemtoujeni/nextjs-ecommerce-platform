"use server"

import { ReturnOne } from "@repo/core/types";
import { CollectionDetail, UpdateCollectionDetail, updateCollectionUseCase } from "@repo/core/usecases";

export const updateCollectionAction = async (collectionId: number, collection: UpdateCollectionDetail) : Promise<ReturnOne<CollectionDetail>> => {
    try {
        const updatedCollection = await updateCollectionUseCase(collectionId, collection);
        return {
            item: updatedCollection,
            error: undefined
        };
    } catch (error: any) {
        return {
            item: undefined as unknown as CollectionDetail,
            error: error instanceof Error ? error.message : "Une erreur est survenue, veuillez réessayer plus tard"
        };
    }
}