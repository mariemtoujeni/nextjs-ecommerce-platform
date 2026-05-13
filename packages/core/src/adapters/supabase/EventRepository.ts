import { Event, EventFilter, EventFilterTypeAdmin, EventInput } from '../../models/Event';
import { IEventRepository } from '../../repositories/IEventRepository';
import { SupabaseClient } from '@supabase/supabase-js';
import { InternalServerError, NotFoundError } from '../../types/error';
import { ActiveFilter, ReturnAll } from '../../types/utils';
import { KeyMap, mapToType } from './MapToType';

const eventKeyMap: KeyMap<Event> = {
    id: 'id',
    name: 'nom',
    status: 'statut',
    image: {
        key: 'image',
        transform: (value) => `/api/assets/${value}`
    },
    description: 'description',
    startDate: 'dateDebut',
    endDate: 'dateFin',
    createdAt: 'created_at',
    url: 'url',
}

type FilterMappingReturn = {
    column: string;
    query: string;
    filterValues: string[];
}
type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => FilterMappingReturn;
export const eventFilter: Record<EventFilterTypeAdmin, FilterMappginFunction> = {
    [EventFilterTypeAdmin.STATE]: (baseQuery, filter) => ({
        column: "statut",
        query: baseQuery,
        filterValues: filter.values as string[]
    })
};


export class EventRepository implements IEventRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
    async readPublishedEvents(): Promise<Event[]> {
        const { data, error } = await this.supabase
             .from('evenements')
             .select('*')
             .eq('statut', 1);
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data ? data.map(event => mapToType<Event>(event, eventKeyMap)) : [];
       
    }

    async createEvent(event: EventInput): Promise<Event> {
        const { data, error } = await this.supabase.from('evenements').insert(
            {
                nom: event.name,
                statut: 0,
                description: event.description,
                dateDebut: event.startDate,
                dateFin: event.endDate,
                image: event.image,
                url: event.url
            }
        ).select('*').single();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<Event>(data, eventKeyMap);
    }

    async updateEvent(event: Event): Promise<Event> {
        const { data, error } = await this.supabase.from('evenements').update(
            {
                nom: event.name,
                statut: event.status,
                description: event.description,
                dateDebut: event.startDate,
                dateFin: event.endDate,
                image: event.image,
                url: event.url
            }
        ).eq('id', event.id).select('*').single();
        if (error) {
            throw new InternalServerError(error.message);
        }

        return mapToType<Event>(data, eventKeyMap);
    }

    async deleteEvent(id: number): Promise<void> {
        const { error } = await this.supabase.from('evenements').delete().eq('id', id);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async readActiveEvents(): Promise<ReturnAll<Event>> {
        const events = await this.supabase.from('evenements').select('*', { count: 'exact' }).eq('statut', 1);
        if (events.error) {
            throw new NotFoundError(events.error.message);
        }
        return {
            items: events?.data ? events.data.map(event => mapToType<Event>(event, eventKeyMap)) : [],
            total: events?.count ?? 0,
            count: events?.data ? events.data.length : 0,
        };
    }

    async readById(id: number): Promise<Event> {
        const { data, error } = await this.supabase.from('evenements').select('*').eq('id', id).single();
        if (error) throw new Error(`find by Id failed: ${error.message}`);

        return mapToType<Event>(data, eventKeyMap);
    }

    async read(options: EventFilter): Promise<ReturnAll<Event>> {
        const startOffset = options.offset * options.limit;
        const endOffset = startOffset + options.limit - 1;
        let querySelect = '*';

        const filterToApply: FilterMappingReturn[] = [];
        if (options.filters) {
            options.filters.forEach(filter => {
            const newFilter = eventFilter[filter.key as EventFilterTypeAdmin](querySelect, filter);
            filterToApply.push(newFilter);
            querySelect = newFilter.query;
            });
        }


        const baseQuery = this.supabase.from('evenements')
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

        const events = await baseQuery;

        if (events.error) {
            throw new NotFoundError(events.error.message);
        }

        return {
            items: events?.data ? events.data.map(event => mapToType<Event>(event, eventKeyMap)) : [],
            total: events?.count ?? 0,
            count: events?.data ? events.data.length : 0,
        };
    }

}