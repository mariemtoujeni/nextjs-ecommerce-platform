import { z } from 'zod';
import { Club } from './Club';

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.number(),
  order: z.number(),
});
export type Category = z.infer<typeof CategorySchema>;
export type SubCategory = Category;
export type Store = Category & { clubId?: number | null, club?: Club };

export type CreateCategoryRequest = Pick<Category, 'name' | 'active' | 'order'>
export type CreateSubCategoryRequest = Pick<SubCategory, 'name' | 'active' | 'order'>
export type CreateStoreRequest = Pick<Store, 'name' | 'active' | 'order' | 'clubId'>

export type CategoryWithSubCategories = Category & {
  subCategories: SubCategory[];
}

export type Brand = Pick<Category, 'id' | 'name'>;

export const categoryOptionsSchema = z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional().default(''),
    filters: z.array(z.object({
        key: z.string(),
        values: z.union([z.array(z.string()), z.array(z.object({
            key: z.string(),
            values: z.array(z.string())
        }))]),
    })).optional(),
})

export type CategoryFilterInput = z.input<typeof categoryOptionsSchema>;
export type CategoryFilter = z.infer<typeof categoryOptionsSchema>;
export enum CategoryFilterTypeAdmin {
    STATE = "STATE",
}

export type StoreMenuLine = {
  store: Store;
  category: Category;
  subCategory: SubCategory;
}

export type StoreMenu = {
  id: number; 
  name: string;
  order: number;
  active: number;
  categories: CategoryWithSubCategories[];
}