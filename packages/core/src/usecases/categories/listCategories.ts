import { Category, CategoryFilterInput, categoryOptionsSchema } from "../../models";
import { BadRequestError, ReturnAll, getInjection } from "../../types";

export const listCategoriesUseCase = async (options?: CategoryFilterInput): Promise<ReturnAll<Category>> => {
  const categoryRepository = await getInjection("ICategoryRepository");

  const validatedOptions = categoryOptionsSchema.safeParse(options || {});
  
  if(!validatedOptions.success) {
      throw new BadRequestError("Invalid options");
  }
  
  const categories = await categoryRepository.readCategoriesList(validatedOptions.data);

  return categories;
};
