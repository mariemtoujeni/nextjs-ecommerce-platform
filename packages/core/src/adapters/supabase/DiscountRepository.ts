import { SupabaseClient } from "@supabase/supabase-js";
import { IDiscountRepository } from "../../repositories";
import { Discount, DiscountFilter, DiscountFilterTypeAdmin, DiscountInput, DiscountLine, DiscountLineInput, DiscountState, DiscountTypeValue, MinPurchaseCondition, OrderDiscount, OrderDiscountInput, ProductShop, TypeDiscount } from "../../models";
import { ActiveFilter, ReturnAll } from "../../types/utils";
import { InternalServerError, NotFoundError } from "../../types/error";
import { KeyMap, mapFromType, mapToType } from "./MapToType";

const discountKeyMap: KeyMap<Discount> = {
    id: "id",
    etat: "etat",
    nom: "nom",
    type: "type",
    id_club: "id_club",
    code: "code",
    combinaison: "combinaison",
    boutique: "boutique",
    date_debut: "date_debut",
    date_fin: "date_fin",
    id_user: "id_user",
    type_condition_achat_min: "type_condition_achat_min",
    valeur_condition_achat_min: "valeur_condition_achat_min",
    nombre_maximal_utilisation: "nombre_maximal_utilisation",
    discountLines: {
            key: 'reduction_lignes',
            transform: (value) => Array.isArray(value)
                ? value.map(discountLine => mapToType<DiscountLine>(discountLine, discountLineKeyMap))
                : []
        }
}

const discountLineKeyMap: KeyMap<DiscountLine> = {
    id: "id",
    id_type: "id_type",
    id_reduction: "id_reduction",
    country_code: "country_code",
    type: "type",
    type_valeur: "type_valeur",
    valeur: "valeur",
    discount: {
            key: 'reductions',
            transform: (value) => mapToType<Discount>(value, discountKeyMap)
        },
}

const orderDiscountKeyMap: KeyMap<OrderDiscount> = {
    id: "id",
    type: "type",
    type_valeur: "type_valeur",
    id_commande: "id_commande",
    id_modele: "id_modele",
    id_reduction: "id_reduction",
    valeur: "valeur",
    info: "info",
    date: "date"
}

type FilterMappingReturn = {
    column: string;
    query: string;
    filterValues: string[];
}
type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => FilterMappingReturn;
export const discountFilter: Record<DiscountFilterTypeAdmin, FilterMappginFunction> = {
    [DiscountFilterTypeAdmin.TYPE]: (baseQuery, filter) => ({
        column: 'type',
        query: baseQuery,
        filterValues: filter.values as string[]
    }),
    [DiscountFilterTypeAdmin.STATE]: (baseQuery, filter) => ({
        column: 'etat',
        query: baseQuery,
        filterValues: filter.values as string[]
    }),
};


export class DiscountRepository implements IDiscountRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
    async createOrderDiscount(orderDiscount: OrderDiscountInput): Promise<OrderDiscount> {
        const { data, error } = await this.supabase.from('commande_reductions')
                                                   .insert(mapFromType(orderDiscount, orderDiscountKeyMap)).select("*").single();
        if (error) throw new InternalServerError(error.message);
        return mapToType<OrderDiscount>(data, orderDiscountKeyMap);
    }

    async readDiscountLineById(id: number): Promise<DiscountLine> {
        const { data, error } = await this.supabase.from("reduction_lignes").select("*, reductions(*)")
            .eq("id", id).single()
        if (error) throw new InternalServerError(error.message);
        return mapToType<DiscountLine>(data, discountLineKeyMap);
    }

    async deleteDiscountLine(id: number): Promise<void> {
        const { error } = await this.supabase.from('reduction_lignes').delete().eq('id', id);
        if (error) throw new InternalServerError(error.message);
    }
    
    async read(userId: string): Promise<Discount[]> {
        throw new Error("Method not implemented.");
    }
    
    async updateDiscountLine(discountLine: DiscountLine): Promise<DiscountLine> {
        const { data, error } = await this.supabase.from('reduction_lignes').update({
            id: discountLine.id,
            id_type: discountLine.id_type,
            id_reduction: discountLine.id_reduction,
            country_code: discountLine.country_code,
            type: discountLine.type,
            type_valeur: discountLine.type_valeur,
            valeur: discountLine.valeur,
        }).eq('id', discountLine.id).select('*').single();
        if (error) { throw new InternalServerError(error.message); }
        return data;
    }

    async deleteDiscount(id: number): Promise<void> {
        const { error: discountLineError } = await this.supabase.from('reduction_lignes').delete().eq('id_reduction', id);
        if (discountLineError) throw new InternalServerError(discountLineError.message);
        const { error } = await this.supabase.from('reductions').delete().eq('id', id);
        if (error) throw new InternalServerError(error.message);
    }
    
    async updateDiscount(discount: Discount): Promise<Discount> {
        
        const { data, error } = await this.supabase
            .from('reductions').update({
                etat: discount.etat,
                nom: discount.nom,
                type: discount.type,
                id_club: discount.id_club,
                code: discount.code,
                combinaison: discount.combinaison,
                boutique: discount.boutique,
                date_debut: discount.date_debut,
                date_fin: discount.date_fin,
                id_user: discount.id_user,
                type_condition_achat_min: discount.type_condition_achat_min,
                valeur_condition_achat_min: discount.valeur_condition_achat_min,
                nombre_maximal_utilisation: discount.nombre_maximal_utilisation,
            }).eq('id', discount.id).select('*').single();

        if (error) {
            throw new InternalServerError(error.message);
        }

        return data;
    }


    async readDiscountById(id: number): Promise<Discount> {
        const { data, error } = await this.supabase.from("reductions").select("*, reduction_lignes(*)")
            .eq("id", id).single()
        if (error) throw new InternalServerError(error.message);
        return mapToType<Discount>(data, discountKeyMap);
    }

    async readCodeDiscount(code: string): Promise<DiscountLine[]> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
        .from("reduction_lignes")
        .select("*, reductions!inner(*)")
        .eq("reductions.code", code)
        .lte("reductions.date_debut", now)
        .or(`date_fin.gte.${now},date_fin.is.null`, { referencedTable: 'reductions' });


    if (error) {
        console.error("Error fetching code discount:", error);
        return [];
    }

    return data ? data.map(discountLine => mapToType<DiscountLine>(discountLine, discountLineKeyMap)) : [];
    }


    async readCampagneDiscount(): Promise<DiscountLine[]> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
        .from("reduction_lignes")
        .select("*, reductions!inner(*)")
        .eq("reductions.type", "CAMPAGNE")
        .lte("reductions.date_debut", now)
        .or(`date_fin.gte.${now},date_fin.is.null`, { referencedTable: 'reductions' })


    if (error) {
        console.error("Error fetching campagne discounts:", error);
        return [];
    }

    return data ? data.map(discountLine => mapToType<DiscountLine>(discountLine, discountLineKeyMap)) : [];
    }


    async addDiscountLine(discountLine: DiscountLineInput): Promise<DiscountLine> {
        const { data, error } = await this.supabase.from('reduction_lignes').insert(discountLine).select("*").single();
        if (error) throw new InternalServerError(error.message);

        return data;
    }

    async readClubDiscount(id: number): Promise<DiscountLine[]> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
        .from("reduction_lignes")
        .select("*, reductions!inner(*)")
        .eq("reductions.id_club", id)
        .lte("reductions.date_debut", now)
        .or(`date_fin.gte.${now},date_fin.is.null`, { referencedTable: 'reductions' });


    if (error) {
        console.error("Error fetching club discounts:", error);
        return [];
    }

    return data ? data.map(discountLine => mapToType<DiscountLine>(discountLine, discountLineKeyMap)) : [];
    }


    async readAll(options: DiscountFilter): Promise<ReturnAll<Discount>> {
        const startOffset = options.offset * options.limit;
        const endOffset = startOffset + options.limit - 1;

        let querySelect = '*';

        const filterToApply: FilterMappingReturn[] = [];
        if (options.filters) {
            options.filters.forEach(filter => {
                const newFilter = discountFilter[filter.key as DiscountFilterTypeAdmin](querySelect, filter);
                filterToApply.push(newFilter);
                querySelect = newFilter.query;
            });
        }

        const baseQuery = this.supabase.from('reductions')
            .select(querySelect, { count: 'exact' })
            .range(startOffset, endOffset)
            .order('id', { ascending: options.sort === 'asc' })

        if (options.search) {
            const searchAsNumber = parseInt(options.search);

            if (!isNaN(searchAsNumber)) {
                baseQuery.eq('id', searchAsNumber);
            } else {
                baseQuery.ilike('code', `%${options.search}%`);
            }
        }

        filterToApply.forEach(filter => {
            baseQuery.in(filter.column, filter.filterValues);
        });

        const discounts = await baseQuery;

        if (discounts.error) throw new NotFoundError(discounts.error.message);

        return {
            items: discounts?.data ? discounts.data.map(discount => mapToType<Discount>(discount, discountKeyMap)) : [],
            total: discounts?.count ?? 0,
            count: discounts?.data ? discounts.data.length : 0,
        };
    }

    async addDiscount(discount: DiscountInput): Promise<Discount> {
        const { data, error } = await this.supabase.from('reductions').insert(discount).select("*").single();
        if (error) throw new InternalServerError(error.message);

        return data;
    }

}