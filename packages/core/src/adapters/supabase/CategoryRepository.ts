import { ICategoryRepository } from "../../repositories/ICategoryRepository";
import { Category, CategoryFilter, CategoryFilterTypeAdmin, CreateCategoryRequest } from "../../models/Category";
import { ActiveFilter, ReturnAll } from "../../types/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { InternalServerError, NotFoundError } from "../../types/error";
import { KeyMap, mapToType } from "./MapToType";

export const categoryKeyMap: KeyMap<Category> = {
    id: 'id',
    name: 'nom',
    active: 'actif',
    order: 'ordre',
}

type FilterMappingReturn = {
    column: string;
    query: string;
    filterValues: string[];
}
type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => FilterMappingReturn;
export const categoryFilter: Record<CategoryFilterTypeAdmin, FilterMappginFunction> = {
    [CategoryFilterTypeAdmin.STATE]: (baseQuery, filter) => ({
        column: "actif",
        query: baseQuery,
        filterValues: filter.values as string[]
    })
};

export class CategoryRepository implements ICategoryRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async createCategory(category: CreateCategoryRequest): Promise<Category> {
    const { data, error } = await this.supabase.from('categories').insert({
      nom: category.name,
      actif: category.active,
      ordre: category.order
    }).select("*").single();
    if (error) throw new InternalServerError(error.message);

    return mapToType<Category>(data, categoryKeyMap);
  }

  async readCategoryById(id: number): Promise<Category> {
    const { data, error } = await this.supabase.from('categories').select('*').eq('id', id).maybeSingle();
    if (error) throw new InternalServerError(error.message);
    return mapToType<Category>(data, categoryKeyMap);
  }

  async readCategoryByName(name: string): Promise<Category> {
    const { data, error } = await this.supabase.from('categories').select("*").eq("nom", name).maybeSingle();
    if (error) throw new InternalServerError(error.message);

    return mapToType<Category>(data, categoryKeyMap);
  }

  async updateCategory(category: Category): Promise<Category> {
    const { data, error } = await this.supabase.from('categories').update({
      nom: category.name,
      actif: category.active,
      ordre: category.order
    }).eq('id', category.id).select().maybeSingle();
    if (error) throw new InternalServerError(error.message);

    return mapToType<Category>(data, categoryKeyMap);
  }

  async deleteCategory(id: number): Promise<void> {
    const { error } = await this.supabase.from('categories').delete().eq('id', id);
    if (error) throw new InternalServerError(error.message);
  }

  async readCategoriesList(options: CategoryFilter): Promise<ReturnAll<Category>> {
    const startOffset = options.offset * options.limit;
    const endOffset = startOffset + options.limit - 1;
    let querySelect = '*';

    const filterToApply: FilterMappingReturn[] = [];
      if (options.filters) {
        options.filters.forEach(filter => {
          const newFilter = categoryFilter[filter.key as CategoryFilterTypeAdmin](querySelect, filter);
          filterToApply.push(newFilter);
          querySelect = newFilter.query;
        });
      }


    const baseQuery = this.supabase.from('categories')
        .select(querySelect, { count: 'exact' })
        .range(startOffset, endOffset)
        .order('id', { ascending: options.sort === 'asc' })

    if (options.search) {
        const searchAsNumber = parseInt(options.search);

        if (!isNaN(searchAsNumber)) {
            baseQuery.eq('id', searchAsNumber);
        } else {
            baseQuery.ilike('nom', `%${options.search}%`);
        }
      }

    filterToApply.forEach(filter => {
        baseQuery.in(filter.column, filter.filterValues);
    });

    const categories = await baseQuery;

    if (categories.error) {
        throw new NotFoundError(categories.error.message);
    }

    return {
      items: categories?.data ? categories.data.map(category => mapToType<Category>(category, categoryKeyMap)) : [],
      total: categories?.count ?? 0,
      count: categories?.data ? categories.data.length : 0,
    };
  }

}
