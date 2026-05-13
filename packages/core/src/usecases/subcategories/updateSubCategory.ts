import { SubCategory } from "../../models";
import { getInjection } from "../../types";

export const updateSubCategoryUseCase = async (subCategory: SubCategory): Promise<SubCategory> => {
    const subCategoryRepository = await getInjection("ISubCategoryRepository");
    const updatedSubCategory = await subCategoryRepository.updateSubCategory(subCategory);
 
    return updatedSubCategory;
}; 