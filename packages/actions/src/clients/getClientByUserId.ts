"use server"

import { getClientByUserIdUseCase } from "@repo/core/usecases";
import { Client } from "@repo/core/models"
import { ReturnOne } from "@repo/core/types";

export const getClientByUserIdAction = async (id: string): Promise<ReturnOne<Client>> => {    
  try {
    const client = await getClientByUserIdUseCase(id);
    return {
        item: client
    };
  } catch (error: any) {
    return {
        item: {} as Client,
        error: error
    };
  }
}