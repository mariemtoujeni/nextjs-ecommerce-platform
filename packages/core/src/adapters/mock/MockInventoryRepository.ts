import { InventoryFilter, Inventory, InventoryInput, InventoryLine } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { IInventoryRepository } from "@repo/core/repositories";
import { SharedMemory } from "./SharedMemory";


export class MockInventoryRepository implements IInventoryRepository {
    updateInventoryLine(inventoryLine: InventoryLine): Promise<InventoryLine> {
        throw new Error("Method not implemented.");
    }
    deleteInventoryLine(inventoryId: number, modelId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getInventoryLines(inventoryId: number, options: InventoryFilter): Promise<ReturnAll<InventoryLine>> {
        throw new Error("Method not implemented.");
    }

    createInventory(inventory: InventoryInput): Promise<Inventory> {
        throw new Error("Method not implemented.");
    }
    
    updateInventory(inventory: Inventory): Promise<Inventory> {
        throw new Error("Method not implemented.");
    }

    createInventoryLine(inventoryLine: InventoryLine): Promise<InventoryLine> {
        SharedMemory.inventoryLine.push(inventoryLine);
        return Promise.resolve(inventoryLine);
    }

    async readById(id: number): Promise<Inventory> {
        const inventory = SharedMemory.inventory.find((inventory) => inventory.id === id);
        if (!inventory) {
            throw new Error("Inventory not found");
        }
        return inventory;
    }

    async read(options: InventoryFilter): Promise<ReturnAll<Inventory>> {
        const { limit, offset, sort } = options;

        const inventories = 'asc' == sort 
            ? [...SharedMemory.inventory].sort((a, b) => a.id - b.id).slice(offset, offset + limit)
            : [...SharedMemory.inventory].sort((a, b) => b.id - a.id).slice(offset, offset + limit);

        return {
            total: SharedMemory.inventory.length,
            count: inventories.length,
            items: inventories as Inventory[]
        };
    }

}