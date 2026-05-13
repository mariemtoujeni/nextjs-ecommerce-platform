import { CategoryFilter, CreateSubCategoryRequest, SubCategory } from "../models"; 
import { ReturnAll } from "../types";

export interface ISubCategoryRepository {

  createSubCategory(subCategory: CreateSubCategoryRequest): Promise<SubCategory>;
  readSubCategoryById(id: number): Promise<SubCategory>;
  readSubCategoryByName(name: string): Promise<SubCategory>;
  updateSubCategory(subCategory: SubCategory): Promise<SubCategory>;
  deleteSubCategory(id: number): Promise<void>;
  readSubCategoriesList(options: CategoryFilter): Promise<ReturnAll<SubCategory>>;

}
