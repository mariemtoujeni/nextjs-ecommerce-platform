"use server"

import { Collection, CollectionInput } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { addCollectionUseCase } from "@repo/core/usecases";

export const createCollectionAction = async (collection: CollectionInput) : Promise<ReturnOne<Collection>> => {
    try {
        const newCollection = await addCollectionUseCase(collection);
        return {
            item: newCollection,
        };
    } catch (error: any) {
        return {
            item: null as unknown as Collection,
            error: error.message,
        };
    }
}