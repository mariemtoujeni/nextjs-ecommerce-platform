import { Category, CategoryFilter, CreateCategoryRequest } from "../models"; 
import { ReturnAll } from "../types";

export interface ICategoryRepository {

  createCategory(category: CreateCategoryRequest): Promise<Category>;
  readCategoryById(id: number): Promise<Category>;
  readCategoryByName(name: string): Promise<Category>;
  updateCategory(category: Category): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  readCategoriesList(options: CategoryFilter): Promise<ReturnAll<Category>>;

}
