import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { Inventory, ModelStockUpdate, UserRoles } from "../../models";
import { getInjection } from "../../types/di";

export const updateInventoryUseCase = async (inventory: Inventory): Promise<Inventory> => {
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();

  if (!user) {
      throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
  }
  user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
  
  const inventoryRepository = await getInjection("IInventoryRepository");
  const updatedInventory = await inventoryRepository.updateInventory(inventory);
  const currentInventory = await inventoryRepository.getInventoryLines(inventory.id, {
    limit: 10000,
    offset: 0,
    sort: "asc",
    search: ""
  });
  const updates: ModelStockUpdate[] = currentInventory.items.map(line => ({
    modelId: line.modelId,
    quantity: line.quantity
  }));

  const stockRepository = await getInjection("IStockRepository");
  await stockRepository.updateModelStocks(updates);

  return updatedInventory;
};
