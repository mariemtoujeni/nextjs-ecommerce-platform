"use server"

import { ReturnAll } from "@repo/core/types";
import { Collection } from "@repo/core/models";
import { listAllCollectionsUseCase } from "@repo/core/usecases";

export const listCollectionsAction = async () : Promise<ReturnAll<Collection>> => {
    try {
        const collections = await listAllCollectionsUseCase();
        return collections;
    } catch (error: any) {
        return {
            items: [],
            error: error.message,
            total: 0,
            count: 0,
        };
    }
}