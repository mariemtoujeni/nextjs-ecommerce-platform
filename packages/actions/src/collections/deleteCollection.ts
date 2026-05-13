"use server"

import { deleteCollectionUseCase } from "@repo/core/usecases";

export const deleteCollectionAction = async (collectionId: number) : Promise<void> => {
    try {
        await deleteCollectionUseCase(collectionId);
    } catch (error: any) {
        throw error;
    }
}