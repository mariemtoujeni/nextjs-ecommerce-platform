"use server"

import { getInventoryByIdUseCase } from "@repo/core/usecases";
import { Inventory } from "@repo/core/models"

export const getInventoryAction = async (id: number): Promise<Inventory> => {    
    try {
    const inventory = await getInventoryByIdUseCase(id);
    return inventory;
    } catch(error) {
        console.error(error);
        throw Error;
    }
}