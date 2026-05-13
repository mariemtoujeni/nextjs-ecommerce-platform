"use server"

import { Tranche } from "@repo/core/models";
import { deleteTrancheUseCase } from "@repo/core/usecases";

export const deleteTrancheAction = async (tranche: Tranche): Promise<void> => {
    try {
        await deleteTrancheUseCase(tranche);
    } catch (error: any) {
        throw error;
    }
}