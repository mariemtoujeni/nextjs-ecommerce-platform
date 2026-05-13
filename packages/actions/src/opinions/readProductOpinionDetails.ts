"use server"

import { Opinion } from "@repo/core/models"
import { readOpinionByProductIdUseCase } from "@repo/core/usecases";

export const getOpinionByProductIdAction = async (id: number): Promise<Opinion[]> => {
    try {
        const opinions = await readOpinionByProductIdUseCase(id);
        return opinions;
    } catch (error: any) {
        throw error;
    }

}