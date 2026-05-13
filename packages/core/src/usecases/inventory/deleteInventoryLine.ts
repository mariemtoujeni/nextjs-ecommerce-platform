import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { getInjection } from "../../types/di";
import { UserRoles } from "../../models";

export const deleteInventoryLineUseCase = async (inventoryId: number, modelId: number): Promise<void> => {
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();

  if (!user) {
      throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
  }
  user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
  
  const inventoryRepository = await getInjection("IInventoryRepository");
  await inventoryRepository.deleteInventoryLine(inventoryId, modelId);
};
