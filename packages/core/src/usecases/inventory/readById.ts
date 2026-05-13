import { Inventory } from "@repo/core/models";
import { getInjection } from "@repo/core/types";

export const getInventoryByIdUseCase = async (id: number): Promise<Inventory> => {
    const inventoryRepository = await getInjection('IInventoryRepository');

    const inventory = await inventoryRepository.readById(id);

    return inventory;
}