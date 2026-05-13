import { BadRequestError, getInjection, ReturnAll } from "@repo/core/types";
import { InventoryFilterInput, InventoryLine, inventoryOptionsSchema } from "../../models/Inventory";


export const getInventoryLinesUseCase = async (inventoryId: number, options?: InventoryFilterInput): Promise<ReturnAll<InventoryLine>> => {
    const inventoryRepository = await getInjection('IInventoryRepository');
    const validatedOptions = inventoryOptionsSchema.safeParse(options || {});
    
    if(!validatedOptions.success) {
        throw new BadRequestError("Invalid options");
    }
    const inventorieLines = await inventoryRepository.getInventoryLines(inventoryId, validatedOptions.data);
    return inventorieLines;
}