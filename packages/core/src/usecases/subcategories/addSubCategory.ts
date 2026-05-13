import { CreateSubCategoryRequest, SubCategory } from "../../models";
import { getInjection } from "../../types";

export const addSubCategoryUseCase = async (subCategory: CreateSubCategoryRequest): Promise<SubCategory> => {
  const subCategoryRepository = await getInjection("ISubCategoryRepository");
  const createdSubCategory = await subCategoryRepository.createSubCategory(subCategory)

  return createdSubCategory;
}; 