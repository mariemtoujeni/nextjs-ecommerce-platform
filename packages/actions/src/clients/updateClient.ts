"use server"

import { updateClientUseCase } from "@repo/core/usecases";
import { ClientUpdateInput, Club } from "@repo/core/models";

export const updateClientAction = async (client: ClientUpdateInput, club?: Club) => {
    try {
        const updatedClient = await updateClientUseCase(client, club);
        return updatedClient;
    } catch (error: any) {
        throw error;
    }
}