import { CategoryFilterInput, categoryOptionsSchema, SubCategory } from "../../models";
import { BadRequestError, ReturnAll, getInjection } from "../../types";

export const listSubCategoriesUseCase = async (options?: CategoryFilterInput): Promise<ReturnAll<SubCategory>> => {
  const subCategoryRepository = await getInjection("ISubCategoryRepository");

  const validatedOptions = categoryOptionsSchema.safeParse(options || {});
  
  if(!validatedOptions.success) {
      throw new BadRequestError("Invalid options");
  }
  
  const subCategories = await subCategoryRepository.readSubCategoriesList(validatedOptions.data);

  return subCategories;
}; 