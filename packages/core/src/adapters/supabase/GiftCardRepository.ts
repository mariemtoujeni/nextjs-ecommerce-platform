import { SupabaseClient } from "@supabase/supabase-js";
import { IGiftCardRepository } from "../../repositories/IGiftCardRepository";
import { Client, GiftCard, GiftCardFilter, GiftCardFilterType, GiftCardInput, GiftCardPresenter, GiftCardStatus } from "../../models";
import { ActiveFilter, ReturnAll } from "../../types/utils";
import { KeyMap, mapFromType, mapToType } from "./MapToType";
import { clientKeyMap } from "./ClientRepository";
import { InternalServerError } from "../../types/error";

export const GiftCardPresenterKeyMap: KeyMap<GiftCardPresenter> = {
    id: 'id',
    value: 'montant',
    code: 'code',
    expirationDate: 'date_fin',
    usedAt: 'date_used',
    used: 'used',
    remainingValue: 'montant_restant',
    clientId: 'numero_client',
    commandId: 'id_commande',
    cancelled: 'corbeille',
    client: {
        key: 'clients',
        transform: (value) => mapToType<Client>(value, clientKeyMap)
    },
    usedBy: {
        key: 'commandes.clients',
        transform: (value) => mapToType<Client>(value, clientKeyMap)
    }
}

export const GiftCardKeyMap: KeyMap<GiftCard> = {
    id: 'id',
    value: 'montant',
    code: 'code',
    expirationDate: 'date_fin',
    usedAt: 'date_used',
    used: 'used',
    remainingValue: 'montant_restant',
    clientId: 'numero_client',
    commandId: 'id_commande',
    cancelled: 'corbeille',
}

type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => any;
export const giftCardFilter: Record<GiftCardFilterType, FilterMappginFunction> = {
    [GiftCardFilterType.STATUS]: (baseQuery, filter) => {
        const values = filter.values as string[];
        let condition = [];
        if (values.includes(GiftCardStatus.USED)) {
            condition.push('used.eq.true');
        }
        if (values.includes(GiftCardStatus.NOT_USED)) {
            condition.push('used.eq.false');
            baseQuery.eq('used', false);
        }
        if (values.includes(GiftCardStatus.EXPIRED)) {
            condition.push('date_fin.lt.now()');
            baseQuery.eq('used', false);
        }
        if (values.includes(GiftCardStatus.CANCELLED)) {
            condition.push('corbeille.eq.1');
        }
        if (condition.length > 0) {
            baseQuery.or(condition.join(','));
        }
        return baseQuery;
    }
}


export class GiftCardRepository implements IGiftCardRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
    

    async listAll(options?: GiftCardFilter): Promise<ReturnAll<GiftCardPresenter>> {
        const { limit, offset, sort, search, filters } = options || {};
        const startOffset = (offset ?? 0) * (limit ?? Number.MAX_SAFE_INTEGER);
        const endOffset = startOffset + (limit ?? Number.MAX_SAFE_INTEGER) - 1;

        const query = this.supabase.from('cheque_cadeau')
            .select('*, clients(*, clubs:id_club_adherent(*)), commandes:id_commande(clients(*, clubs:id_club_adherent(*)))', { count: 'exact' });

        if (search && search !== '') {
            query.or(`code.ilike.%${search}%`); // ,clients.nom.ilike.%${search}%,clients.prenom.ilike.%${search}%
        }

        if (filters) {
            for (const filter of filters) {
                const filterKey = filter.key as GiftCardFilterType;
                if (giftCardFilter[filterKey]) {
                    giftCardFilter[filterKey](query, filter);
                }
            }
        }

        const { data, error, count } = await query.range(startOffset, endOffset).order('id', { ascending: sort === 'asc' });
        if (error) {
            throw new InternalServerError(error.message);
        }
        return {
            items: data.map((item) => mapToType<GiftCardPresenter>(item, GiftCardPresenterKeyMap)),
            total: count ?? data.length,
            count: data.length
        };
    }

    async create(giftCard: GiftCardInput): Promise<GiftCard> {
        const { data, error } = await this.supabase.from('cheque_cadeau').insert(mapFromType(giftCard, GiftCardKeyMap)).select().single();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<GiftCard>(data, GiftCardKeyMap);
    }

    async update(giftCard: GiftCardInput): Promise<GiftCard> {
        const { data, error } = await this.supabase.from('cheque_cadeau').update(mapFromType(giftCard, GiftCardKeyMap)).eq('id', giftCard.id).select().single();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<GiftCard>(data, GiftCardKeyMap);
    }

    async delete(id: number): Promise<void> {
        const { error } = await this.supabase.from('cheque_cadeau').delete().eq('id', id);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }
    async read(orderIds: number[]): Promise<GiftCard[]> {
        const { data, error } = await this.supabase.from('cheque_cadeau')
            .select('*')
            .in('id_commande', orderIds)
            .gt('montant_restant', 0)
            .select();

        if (error) {
            throw new InternalServerError(error.message);
        }
        return data.map(giftCards => mapToType<GiftCard>(giftCards, GiftCardKeyMap))
    }
}