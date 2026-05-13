"use server"

import { readProductOpinionUseCase } from "@repo/core/usecases";

export const getProductOpinionAction = async (id: number): Promise<number | null> => {
    try {
        const opinions = await readProductOpinionUseCase(id);
        return opinions;
    } catch (error: any) {
        throw error;
    }

}