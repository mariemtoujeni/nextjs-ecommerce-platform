import { SubCategory } from "../../models";
import { getInjection } from "../../types";

export const getSubCategoryByIdUseCase = async (subCategoryId: number): Promise<SubCategory> => {
  const subCategoryRepository = await getInjection("ISubCategoryRepository");
  const subCategory = await subCategoryRepository.readSubCategoryById(subCategoryId);

  return subCategory;
}; 