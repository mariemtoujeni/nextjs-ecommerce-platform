"use server"

import { Tranche } from "@repo/core/models";
import { addTrancheUseCase } from "@repo/core/usecases";

export const addTrancheAction = async (newTranche: Tranche) : Promise<Tranche> => {
    try {
        const tranche = await addTrancheUseCase(newTranche);
        return tranche;
    } catch (error: any) {
        throw error;
    }
}