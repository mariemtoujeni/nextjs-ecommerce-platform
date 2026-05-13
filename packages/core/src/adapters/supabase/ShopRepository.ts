import { Shop, ShopFilterInput, ShopLine, ShopPresenter } from "../../models/Shop";
import { ShopInput, ShopLineInput } from "../../models/Shop";
import { ShopFilterType, ShopStatus, Department } from "../../models/Shop";
import { KeyMap, mapFromType, mapToType } from "./MapToType";
import { ActiveFilter } from "../../types/utils";
import { InternalServerError, NotFoundError } from "../../types/error";
import { ReturnAll } from "../../types/utils";
import { IShopRepository } from "../../repositories/IShopRepository";
import { SupabaseClient } from "@supabase/supabase-js";

export const ShopKeyMap: KeyMap<Shop> = {
    id: 'id',
    name: 'nom',
    expirationDate: 'date_fin',
    isActive: 'actif',
    createdAt: 'date_creation',
    status: 'statut',
    department: 'numero_departement'
}

export const ShopLineKeyMap: KeyMap<ShopLine> = {
    idModel: 'id_modele',
    idShop: 'id_point_vente',
    initialQuantity: 'stock_initial',
    soldQuantity: 'stock_vendu',
    finalQuantity: 'stock_final',
    totalPriceTTC: 'prix_total_ttc'
}

type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => any;

const shopFilter: Record<ShopFilterType, FilterMappginFunction> = {
    [ShopFilterType.STATUS]: (baseQuery, filter) => {
        const values = filter.values as string[];
        const filterValue = values.map(value => value as ShopStatus);
        return baseQuery.in('statut', filterValue);
    },
    [ShopFilterType.DEPARTMENT]: (baseQuery, filter) => {
        const values = filter.values as string[];
        const filterValue = values.map(value => value as Department);
        return baseQuery.in('numero_departement', filterValue);
    }
}

export class ShopRepository implements IShopRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async readShops(onlyActive: boolean, options?: ShopFilterInput) : Promise<ReturnAll<Shop>> {
        const { limit, offset, sort, search, filters } = options || {};
        const startOffset = (offset ?? 0) * (limit ?? Number.MAX_SAFE_INTEGER);
        const endOffset = startOffset + (limit ?? Number.MAX_SAFE_INTEGER) - 1;        

        const query = this.supabase.from('point_ventes').select('*', { count: 'exact' });
        if(onlyActive) {
            query.eq('actif', true);
            query.eq('statut', ShopStatus.OPEN);
        }

        if(search && search !== '') {
            query.or(`nom.ilike.%${search}%,numero_departement.ilike.%${search}%`);
        }

        if(filters) {
            filters.forEach(filter => {
                const filterKey = filter.key as ShopFilterType;
                if(shopFilter[filterKey]) {
                    shopFilter[filterKey](query, filter);
                }
            });                      
        }
        
        const { data, error, count } = await query.range(startOffset, endOffset).order('id', { ascending: sort === 'asc' });
        if (error) {
            throw new InternalServerError(error.message);
        }
        return {
            items: data.map((item) => mapToType<Shop>(item, ShopKeyMap)),
            total: count ?? data.length,
            count: data.length
        };
    }

    async readShopById(id: number) : Promise<ShopPresenter> {
        const { data, error } = await this.supabase.from('point_ventes').select('*, point_vente_lignes(*)').eq('id', id).single();
        if(error) {
            throw new NotFoundError(`Shop with id ${id} not found`);
        }
        const shop = mapToType<Shop>(data, ShopKeyMap);
        const lines = data.point_vente_lignes.map((line : any) => mapToType<ShopLine>(line, ShopLineKeyMap));
        return {
            ...shop,
            lines
        };
    }

    async updateShop(id: number, shop: ShopInput) : Promise<Shop> {
        const { data, error } = await this.supabase.from('point_ventes').update(
            mapFromType(shop, ShopKeyMap)
        ).eq('id', id).select().single();
        if(error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<Shop>(data, ShopKeyMap);
    }

    async updateShopLine(shopLine: ShopLineInput[]) : Promise<ShopLine[]> {
        const { data, error } = await this.supabase.from('point_vente_lignes').upsert(
            shopLine.map(line => mapFromType(line, ShopLineKeyMap))
        ).select();
        if(error) {
            throw new InternalServerError(error.message);
        }
        return data.map((item) => mapToType<ShopLine>(item, ShopLineKeyMap));
    }

    async createShop(shop: ShopInput) : Promise<Shop> {
        const { data, error } = await this.supabase.from('point_ventes').insert(mapFromType(shop, ShopKeyMap)).select().single();
        if(error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<Shop>(data, ShopKeyMap);
    }

    async createShopLine(shopLines: ShopLineInput[]) : Promise<ShopLine[]> {
        const { data, error } = await this.supabase.from('point_vente_lignes').insert(shopLines.map(line => mapFromType(line, ShopLineKeyMap))).select();
        if(error) {
            throw new InternalServerError(error.message);
        }
        return data.map((item) => mapToType<ShopLine>(item, ShopLineKeyMap));
    }

    async deleteShop(id: number) : Promise<void> {
        const { error } = await this.supabase.from('point_ventes').delete().eq('id', id);
        if(error) {
            throw new InternalServerError(error.message);
        }
    }

    async deleteShopLine(idModel: number, idShop: number) : Promise<void> {
        const { error } = await this.supabase.from('point_vente_lignes').delete().eq('id_modele', idModel).eq('id_point_vente', idShop);
        if(error) {
            throw new InternalServerError(error.message);
        }
    }
}