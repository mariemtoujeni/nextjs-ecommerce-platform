import { BadRequestError, getInjection, ReturnAll } from "@repo/core/types";
import { Inventory, InventoryFilterInput, inventoryOptionsSchema } from "../../models/Inventory";


export const listAllInventoriesUseCase = async (options?: InventoryFilterInput): Promise<ReturnAll<Inventory>> => {

    const validatedOptions = inventoryOptionsSchema.safeParse(options || {});

    if(!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }

    const inventoryRepository = await getInjection('IInventoryRepository');

    const inventories = await inventoryRepository.read(validatedOptions.data);

    return inventories;
}