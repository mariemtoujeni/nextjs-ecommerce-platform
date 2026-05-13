import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { InventoryLine, UserRoles } from "../../models";
import { getInjection } from "../../types/di";

export const createInventoryLineUseCase = async (inventoryLine: InventoryLine): Promise<InventoryLine> => {
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();

  if (!user) {
      throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
  }
  user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
  
  const inventoryRepository = await getInjection("IInventoryRepository");

  const createdInventoryLine = await inventoryRepository.createInventoryLine(inventoryLine);
  return createdInventoryLine;
}