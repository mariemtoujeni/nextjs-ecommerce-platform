"use server"
import { ReturnAll } from "@repo/core/types";
import { listAllInventoriesUseCase } from "@repo/core/usecases";
import { Inventory, InventoryFilterInput } from "@repo/core/models";


export const getInventoryListAction = async (options?: InventoryFilterInput): Promise <ReturnAll<Inventory>> => {
    try {
        const inventories = await listAllInventoriesUseCase(options);
        return inventories;
    } catch (error: any) {
        return {
            total: 0,
            items: [] as Inventory[],
            count: 0,
            error: error.message,
        } as ReturnAll<Inventory>;
    }
}