import { Category } from "../../models";
import { getInjection } from "../../types";

export const getCategoryByIdUseCase = async (categoryId: number): Promise<Category> => {
  const categoryRepository = await getInjection("ICategoryRepository");
  const category = await categoryRepository.readCategoryById(categoryId);

  return category;
}; 