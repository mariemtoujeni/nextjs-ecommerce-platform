import { CategoryFilter, CategoryFilterTypeAdmin, CreateSubCategoryRequest, SubCategory } from "../../models/Category";
import { ActiveFilter, ReturnAll } from "../../types/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { InternalServerError, NotFoundError } from "../../types/error";
import { KeyMap, mapToType } from "./MapToType";
import { ISubCategoryRepository } from "../../repositories";
import { categoryFilter, categoryKeyMap } from "./CategoryRepository";

export const subCategoryKeyMap: KeyMap<SubCategory> = Object.assign({}, categoryKeyMap);

type FilterMappingReturn = {
    column: string;
    query: string;
    filterValues: string[];
}
type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => FilterMappingReturn;

export class SubCategoryRepository implements ISubCategoryRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
      this.supabase = supabase;
  }

  async createSubCategory(subCategory: CreateSubCategoryRequest): Promise<SubCategory> {
    const { data, error } = await this.supabase.from('sous_categories').insert({
      nom: subCategory.name,
      actif: subCategory.active,
      ordre: subCategory.order
    }).select("*").single();
    if (error) throw new InternalServerError(error.message);

    return mapToType<SubCategory>(data, subCategoryKeyMap);
  }

  async readSubCategoryById(id: number): Promise<SubCategory> {
    const { data, error } = await this.supabase.from('sous_categories').select('*').eq('id', id).maybeSingle();
    if (error) throw new InternalServerError(error.message);
    return mapToType<SubCategory>(data, subCategoryKeyMap);
  }

  async readSubCategoryByName(name: string): Promise<SubCategory> {
    const { data, error } = await this.supabase.from('sous_categories').select("*").eq("nom", name).maybeSingle();
    if (error) throw new InternalServerError(error.message);

    return mapToType<SubCategory>(data, subCategoryKeyMap);
  }

  async updateSubCategory(subCategory: SubCategory): Promise<SubCategory> {
    const { data, error } = await this.supabase.from('sous_categories').update({
      nom: subCategory.name,
      actif: subCategory.active,
      ordre: subCategory.order
    }).eq('id', subCategory.id).select().maybeSingle();
    if (error) throw new InternalServerError(error.message);

    return mapToType<SubCategory>(data, subCategoryKeyMap);
  }

  async deleteSubCategory(id: number): Promise<void> {
    const { error } = await this.supabase.from('sous_categories').delete().eq('id', id);
    if (error) throw new InternalServerError(error.message);
  }

  async readSubCategoriesList(options: CategoryFilter): Promise<ReturnAll<SubCategory>> {
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

    const baseQuery = this.supabase.from('sous_categories')
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

    const subCategories = await baseQuery;

    if (subCategories.error) {
        throw new NotFoundError(subCategories.error.message);
    }
    return {
      items: subCategories?.data ? subCategories.data.map(subCategory => mapToType<SubCategory>(subCategory, subCategoryKeyMap)) : [],
      total: subCategories?.count ?? 0,
      count: subCategories?.data ? subCategories.data.length : 0,
    };
  }

}
