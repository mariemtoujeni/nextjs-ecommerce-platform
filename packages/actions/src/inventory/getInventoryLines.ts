"use server"

import { getInventoryLinesUseCase } from "@repo/core/usecases";
import { InventoryFilterInput, InventoryLine } from "@repo/core/models"
import { ReturnAll } from "@repo/core/types";

export const getInventoryLinesAction = async (id: number, options?: InventoryFilterInput): Promise<ReturnAll<InventoryLine>> => {    
    try{
    const inventory = await getInventoryLinesUseCase(id, options);
    return inventory;
    } catch (error: any) {
        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }
    }
}
