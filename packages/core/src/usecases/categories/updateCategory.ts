import { ErrorCodes, UnauthorizedError } from "../../types/error";
import { Category, UserRoles } from "../../models";
import { getInjection } from "../../types/di";

export const updateCategoryUseCase = async (category: Category): Promise<Category> => {
  const authService = await getInjection("IAuthenticationService");
  const user = await authService.getUser();

  if (!user) {
      throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
  }
  user.validateRole([UserRoles.SUPER_ADMIN, UserRoles.EDITOR]);
  
  const categoryRepository = await getInjection("ICategoryRepository");
  const updatedCategory = await categoryRepository.updateCategory(category);
  return updatedCategory;
};
