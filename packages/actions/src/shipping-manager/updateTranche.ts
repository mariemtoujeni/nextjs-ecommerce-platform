"use server"

import { Tranche } from "@repo/core/models";
import { updateTrancheUseCase } from "@repo/core/usecases";

export const updateTrancheAction = async (oldTranche: Tranche, newTranche: Tranche): Promise<Tranche> => {
    try {
        const updatedTranche = await updateTrancheUseCase(oldTranche, newTranche);
        return updatedTranche;
    } catch (error: any) {
        throw error;
    }
}
