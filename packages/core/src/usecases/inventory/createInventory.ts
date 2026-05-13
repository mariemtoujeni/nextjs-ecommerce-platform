import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { Inventory, InventoryInput, UserRoles } from "../../models";
import { getInjection } from "../../types/di";

export const createInventoryUseCase = async (inventory: InventoryInput): Promise<Inventory> => {
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();

  if (!user) {
      throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
  }
  user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
  
  const inventoryRepository = await getInjection("IInventoryRepository");
  const createdInventory = await inventoryRepository.createInventory(inventory);

  return createdInventory;
}