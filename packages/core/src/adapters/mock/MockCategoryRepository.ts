import { ICategoryRepository } from "../../repositories";
import { Category, CategoryFilter } from "../../models";
import { SharedMemory } from "./SharedMemory";
import { InternalServerError } from "../../types/error";
import { ReturnAll } from '../../types/utils';

export class MockCategoryRepository implements ICategoryRepository {

    async createCategory(data: Category): Promise<Category> {
        SharedMemory.categories.push(data);
        return data;
    }

    async readCategoryById(id: number): Promise<Category> {
        const category = SharedMemory.categories.find(category => category.id === id);
        if (!category) {
            throw new InternalServerError('Category not found');
        }
        return category;
    }

    async readCategoryByName(name: string): Promise<Category> {
        const category = SharedMemory.categories.find(category => category.name === name);
        if (!category) {
            throw new InternalServerError('Category not found');
        }
        return category;
    }

    async updateCategory(data: Category): Promise<Category> {
        const index = SharedMemory.categories.findIndex(category => category.id === data.id);
        SharedMemory.categories[index] = data;
        return data;
    }

    async deleteCategory(id: number): Promise<void> {
        SharedMemory.categories = SharedMemory.categories.filter(category => category.id !== id);
    }

    async readCategoriesList(options: CategoryFilter): Promise<ReturnAll<Category>> {
        const { limit, offset, sort } = options;

        const categories = 'asc' == sort
            ? [...SharedMemory.categories].sort((a, b) => a.id - b.id).slice(offset, offset + limit)
            : [...SharedMemory.categories].sort((a, b) => b.id - a.id).slice(offset, offset + limit);

        return {
            total: SharedMemory.categories.length,
            count: categories.length,
            items: categories,
        };
    }

}
