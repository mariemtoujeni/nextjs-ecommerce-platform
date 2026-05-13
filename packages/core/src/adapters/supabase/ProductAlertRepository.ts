import { InsertedProductAlert,ClientDetail, ModelWithProductDetail, ProductAlert, ProductAlertFilter, ProductAlertFilterTypeAdmin, CreateAlertInput } from '../../models/ProductAlert';
import { Product, Stock } from '../../models/Product';
import { IProductAlertRepository } from '../../repositories/IProductAlertRepository';
import { SupabaseClient } from '@supabase/supabase-js';
import { InternalServerError, NotFoundError } from '../../types/error';
import { ActiveFilter, ReturnAll } from '../../types/utils';
import { KeyMap, mapToType } from './MapToType';
import { modelKeyMap } from './ModelRepository';
import { productKeyMap } from './ProductRepository';
import { StockKeyMap } from './StockRepository';

const clientKeyMap: KeyMap<ClientDetail> = {
    userId: 'id_user',
    email: 'email',
    firstName: 'prenom',
    lastName: 'nom'
};

export const modelWithProductDetailKeyMap: KeyMap<ModelWithProductDetail> = {
    ...modelKeyMap,
    productDetails: {
        key: 'produits',
        transform: (value) => mapToType<Product>(value, productKeyMap),
    },
    stock: {
        key: 'stocks',
        transform: (value) => mapToType<Stock>(value, StockKeyMap),
    }
};

const productAlertKeyMap: KeyMap<ProductAlert> = {
    id: 'id',
    clientNumber: 'numero_client',
    client: {
        key: 'clients',
        transform: (value) => mapToType<ClientDetail>(value, clientKeyMap),
    },
    idModel: 'id_modele',
    email: 'email',
    createdAt: 'date_creation',
    isEmailSent: 'email_envoye',
    isActif: 'actif',
    model: {
        key: 'modeles',
        transform: (value) => mapToType<ModelWithProductDetail>(value, modelWithProductDetailKeyMap),
    }
};


type FilterMappingReturn = {
    column: string;
    query: string;
    filterValues: string[];
}
type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => FilterMappingReturn;
export const productAlertFilter: Record<ProductAlertFilterTypeAdmin, FilterMappginFunction> = {
    [ProductAlertFilterTypeAdmin.STATE]: (baseQuery, filter) => ({
        column: "actif",
        query: baseQuery,
        filterValues: filter.values as string[]
    })
};


export class ProductAlertRepository implements IProductAlertRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
    
    async create(productAlert: CreateAlertInput): Promise<ProductAlert> {
        const { data, error } = await this.supabase.from('alertes_rupture').insert(
            {
                numero_client: productAlert.clientNumber,
                id_modele: productAlert.idModel,
                email: productAlert.email,
                email_envoye: false,
                actif: true
            }
        ).select('*, clients(*), modeles (*, produits ( produit_descriptions(*), produit_images(*) ))').single();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<ProductAlert>(data, productAlertKeyMap);
    }

    async read(options: ProductAlertFilter): Promise<ReturnAll<ProductAlert>> {
        const startOffset = options.offset * options.limit;
        const endOffset = startOffset + options.limit - 1;
        let querySelect = '*, clients(*), modeles (*, stocks(*), produits ( produit_descriptions(*), produit_images(*) ), modele_attribut_valeurs(*, attribut_valeurs(*) ) )';

        const filterToApply: FilterMappingReturn[] = [];
        if (options.filters) {
            options.filters.forEach(filter => {
            const newFilter = productAlertFilter[filter.key as ProductAlertFilterTypeAdmin](querySelect, filter);
            filterToApply.push(newFilter);
            querySelect = newFilter.query;
            });
        }


        const baseQuery = this.supabase.from('alertes_rupture')
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

        const productAlerts = await baseQuery;

        if (productAlerts.error) {
            throw new NotFoundError(productAlerts.error.message);
        }

        return {
            items: productAlerts?.data ? productAlerts.data.map(productAlert => mapToType<ProductAlert>(productAlert, productAlertKeyMap)) : [],
            total: productAlerts?.count ?? 0,
            count: productAlerts?.data ? productAlerts.data.length : 0,
        };
    }

    async delete(id: number): Promise<void> {
        const { error } = await this.supabase.from('alertes_rupture').delete().eq('id', id);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }
    
    async update(productAlert: ProductAlert): Promise<ProductAlert> {
        const { data: data, error: updateError } = await this.supabase
            .from('alertes_rupture')
            .update({  
                email_envoye: productAlert.isEmailSent,
                actif: productAlert.isActif
             })
            .eq('id', productAlert.id)
            .select('*, clients(*), modeles (id, produits ( produit_descriptions(*), produit_images(*) ))').single();

        if (updateError) {
            throw new InternalServerError(updateError.message);
        }
        return mapToType<ProductAlert>(data, productAlertKeyMap);
    }

    async createAlertProduct(modelId: number, email: string): Promise<InsertedProductAlert> {
        const { data, error } = await this.supabase
                                          .from('alertes_rupture')
                                          .insert(
                                              {
                                                  id_modele: modelId,
                                                  email: email,                                                  
                                                  date_creation: new Date()                                                 
                                                  
                                              }
                                          ).single();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<InsertedProductAlert>(data, productAlertKeyMap);
    }

}