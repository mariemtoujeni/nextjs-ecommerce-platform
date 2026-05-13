import { Inventory, InventoryFilter, InventoryInput, InventoryLine } from "@repo/core/models";
import { ReturnAll } from "../types";

export interface IInventoryRepository {
    read(options: InventoryFilter): Promise<ReturnAll<Inventory>>; 
    readById(id: number): Promise<Inventory>;
    createInventory(inventory: InventoryInput): Promise<Inventory>;
    updateInventory(inventory: Inventory): Promise<Inventory>;
    createInventoryLine(inventoryLine: InventoryLine): Promise<InventoryLine>;
    updateInventoryLine(inventoryLine: InventoryLine): Promise<InventoryLine>;
    deleteInventoryLine(inventoryId: number, modelId: number): Promise<void>;
    getInventoryLines(inventoryId: number, options: InventoryFilter): Promise<ReturnAll<InventoryLine>>;
}