"use server"

import { Opinion } from "@repo/core/models"
import { readOpinionById } from "@repo/core/usecases";

export const getOpinionById = async (id: number): Promise<Opinion | null> => {
    try {
        const opinions = await readOpinionById(id);
        return opinions;
    } catch (error: any) {
        throw error;
    }

}