import { getInjection } from "../../types";

export const deleteSubCategoryUseCase = async (id: number): Promise<void> => {
  const subCategoryRepository = await getInjection("ISubCategoryRepository");
  await subCategoryRepository.deleteSubCategory(id);
}; 