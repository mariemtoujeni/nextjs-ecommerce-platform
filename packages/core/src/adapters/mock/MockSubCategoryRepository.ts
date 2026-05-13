import { CategoryFilter, SubCategory } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { InternalServerError } from "../../types/error";
import { ReturnAll } from "../../types/utils";
import { ISubCategoryRepository } from "../../repositories";

export class MockSubCategoryRepository implements ISubCategoryRepository {

    async createSubCategory(data: SubCategory): Promise<SubCategory> {
        SharedMemory.subCategories.push(data);
        return data;
    }

    async readSubCategoryById(id: number): Promise<SubCategory> {
        const subCategory = SharedMemory.subCategories.find(subCategory => subCategory.id === id);
        if (!subCategory) {
            throw new InternalServerError('SubCategory not found');
        }
        return subCategory;
    }

    async readSubCategoryByName(name: string): Promise<SubCategory> {
        const subCategory = SharedMemory.subCategories.find(subCategory => subCategory.name === name);
        if (!subCategory) {
            throw new InternalServerError('SubCategory not found');
        }
        return subCategory;
    }

    async updateSubCategory(data: SubCategory): Promise<SubCategory> {
        const index = SharedMemory.subCategories.findIndex(subCategory => subCategory.id === data.id);
        SharedMemory.subCategories[index] = data;
        return data;
    }

    async deleteSubCategory(id: number): Promise<void> {
        SharedMemory.subCategories = SharedMemory.subCategories.filter(subCategory => subCategory.id !== id);
    }

    async readSubCategoriesList(options: CategoryFilter): Promise<ReturnAll<SubCategory>> {
        const { limit, offset, sort } = options;

        const subCategories = 'asc' == sort
            ? [...SharedMemory.subCategories].sort((a, b) => a.id - b.id).slice(offset, offset + limit)
            : [...SharedMemory.subCategories].sort((a, b) => b.id - a.id).slice(offset, offset + limit);

        return {
            total: SharedMemory.subCategories.length,
            count: subCategories.length,
            items: subCategories,
        };
    }

}
