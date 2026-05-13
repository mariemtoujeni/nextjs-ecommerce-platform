import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { InventoryLine, UserRoles } from "../../models";
import { getInjection } from "../../types/di";

export const updateInventoryLineUseCase = async (inventoryLine: InventoryLine): Promise<InventoryLine> => {
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();

  if (!user) {
      throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
  }
  user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
  
  const inventoryLineRepository = await getInjection("IInventoryRepository");
  const updatedInventoryLine = await inventoryLineRepository.updateInventoryLine(inventoryLine);
  return updatedInventoryLine;
};
