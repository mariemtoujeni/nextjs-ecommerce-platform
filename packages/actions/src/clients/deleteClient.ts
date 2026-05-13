"use server"

import { deleteClientDataUseCase } from "@repo/core/usecases";

export const deleteClientAction = async (ClientId: number) : Promise<void> => {
    try {
        await deleteClientDataUseCase(ClientId);
    } catch (error: any) {
        throw error;
    }
}