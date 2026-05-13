"use server"

import { getClientByIdUseCase } from "@repo/core/usecases";
import { Client } from "@repo/core/models"

export const getClientAction = async (id: number): Promise<Client> => {    
  try {
    const client = await getClientByIdUseCase(id);
    return client;
  } catch (error: any) {
    throw error;
  }
}