import { Store, CategoryFilter, CreateStoreRequest, StoreMenuLine, Category, SubCategory, CategoryFilterTypeAdmin } from "../../models/Category";
import { ActiveFilter, ReturnAll } from "../../types/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { InternalServerError, NotFoundError } from "../../types/error";
import { KeyMap, mapToType } from "./MapToType";
import { IStoreRepository } from "../../repositories/IStoreRepository";
import { categoryFilter, categoryKeyMap } from "./CategoryRepository";
import { subCategoryKeyMap } from "./SubCategoryRepository";
import { clubKeyMap } from "./ClientRepository";
import { Club } from "../../models/Club";


export const storeKeyMap: KeyMap<Store> = {
  id: 'id',
  name: 'nom',
  active: 'actif',
  order: 'ordre',
  clubId: 'id_club',
  club: {
    key: 'clubs',
    transform: (value) => mapToType<Club>(value, clubKeyMap)
  },
};

type FilterMappingReturn = {
    column: string;
    query: string;
    filterValues: string[];
}
type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => FilterMappingReturn;
export class StoreRepository implements IStoreRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
      this.supabase = supabase;
  }

  async createStore(store: CreateStoreRequest): Promise<Store> {
    const { data, error } = await this.supabase.from('magasins').insert({
      nom: store.name,
      actif: store.active,
      ordre: store.order,
      id_club: store.clubId
    }).select("*").single();
    if (error) throw new InternalServerError(error.message);
    return mapToType<Store>(data, storeKeyMap);
  }

  async readStoreById(id: number): Promise<Store> {
    const { data, error } = await this.supabase.from('magasins').select('*, clubs(*)').eq('id', id).maybeSingle();
    if (error) throw new InternalServerError(error.message);
    return mapToType<Store>(data, storeKeyMap);
  }

  async readStoreByName(name: string): Promise<Store> {
    const { data, error } = await this.supabase.from('magasins').select("*").eq("nom", name).maybeSingle();
    if (error) throw new InternalServerError(error.message);

    return mapToType<Store>(data, storeKeyMap);
  }

  async updateStore(store: Store): Promise<Store> {
    const { data, error } = await this.supabase.from('magasins').update({
      nom: store.name,
      actif: store.active,
      ordre: store.order,
      id_club: store.clubId 
    }).eq('id', store.id).select().maybeSingle();
    if (error) throw new InternalServerError(error.message);
    return mapToType<Store>(data, storeKeyMap);
  }

  async deleteStore(id: number): Promise<void> {
    const { error } = await this.supabase.from('magasins').delete().eq('id', id);
    if (error) throw new InternalServerError(error.message);
  }

  async readStoresList(options: CategoryFilter): Promise<ReturnAll<Store>> {
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

    const baseQuery = this.supabase.from('magasins')
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

    const stores = await baseQuery;

    if (stores.error) {
        throw new NotFoundError(stores.error.message);
    }

    return {
      items: stores?.data ? stores.data.map(store => mapToType<Store>(store, storeKeyMap)) : [],
      total: stores?.count ?? 0,
      count: stores?.data ? stores.data.length : 0,
    };
  }

  async readByProductId(id: number): Promise<Store[]> {
    const { data, error } = await this.supabase.from('produit_magasins').select('*, magasins!inner(*)').eq('id_produit', id);
    if (error) throw new InternalServerError(error.message);
    return data?.map(store => mapToType<Store>(store.magasins, storeKeyMap)) ?? [];
  }

  async addProductToStores(id: number, stores: number[]): Promise<void> {
    const { error } = await this.supabase.from('produit_magasins').upsert(stores.map(store => ({ id_produit: id, id_magasin: store })));
    if (error) throw new InternalServerError(error.message);
  }

  async deleteProductFromStores(id: number, stores: number[]): Promise<void> {
    const { error } = await this.supabase.from('produit_magasins').delete().eq('id_produit', id).in('id_magasin', stores);
    if (error) throw new InternalServerError(error.message);
  }

  async readMenu(lang: string): Promise<StoreMenuLine[]> {
    const { data, error } = await this.supabase.rpc('get_store_menu', { lang_param: lang });
    if (error) throw new InternalServerError(error.message);

    return data?.map((menu: any) => ({
      store: mapToType<Store>(menu.magasins, storeKeyMap),
      category: mapToType<Category>(menu.categories, categoryKeyMap),
      subCategory: mapToType<SubCategory>(menu.sous_categories, subCategoryKeyMap),
    })) ?? [];
  }


}
