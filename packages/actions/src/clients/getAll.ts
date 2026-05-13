"use server"

import { ClientFilterInput, ClientType } from "@repo/core/models";
import { listAllClientsUseCase } from "@repo/core/usecases";

export const getAllClientAction = async (options?: ClientFilterInput) => {
    try 
    {
        const clients = await listAllClientsUseCase(options);
        return clients;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
}