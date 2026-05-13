"use server"

import { updateCollections } from "@repo/core/usecases";

export const updateProductCollectionsAction = async (productId: number, collections: number[]) => {
    try {
        await updateCollections(productId, collections);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}