import { SupabaseClient } from "@supabase/supabase-js";
import { Opinion, OpinionFilter, OpinionFilterTypeAdmin, opinionInput, opinionOptionsSchema } from '../../models/Opinion';
import { IOpinionRepository } from "../../repositories/IOpinionRepository";
import { NotFoundError } from "../../types/error";
import { ActiveFilter, ReturnAll } from "../../types/utils";
import { KeyMap, mapToType } from "./MapToType";
import { ClientInfo, ProductDescriptions, ProductImages, ProductInfo } from "../../models/Opinion";
import { productImageKeyMap } from "./ProductRepository";
import { Client } from "../../models";



const productDescriptionKeyMap: KeyMap<ProductDescriptions> = {
    title: 'titre',
    description: 'description',
}

const clientKeyMap: KeyMap<ClientInfo> = {
    userId: 'id_user',
    email: 'email',
    firstName: 'prenom',
    lastName: 'nom',
    phone: 'telephone_domicile',
    mobilePhone: 'telephone_portable',
    clientNumber: 'numero_client'
};
const productKeyMap: KeyMap<ProductInfo> = {
    id: 'id'
}
export const opinionKeyMap: KeyMap<Opinion> = {
    id: 'id',
    productId: 'id_produit',
    product: {
        key: 'produits',
        transform: (value) => mapToType<ProductInfo>(value, productKeyMap)
    },
    userId: 'numero_client',
    client: {
        key: 'clients',
        transform: (value) => mapToType<ClientInfo>(value, clientKeyMap)

    },
    pseudo: 'pseudo',
    email: 'email',
    title: 'titre',
    text: 'texte',
    rating: 'note',
    createdAt: 'date_ajout',
    modelId: 'id_modele',
    commandId: 'id_commande',
    responseAdmin: 'reponse_admin',
    validated: 'valide',
    actif: 'actif',
    descriptions: {
        key: 'produits.produit_descriptions',
        transform: (value) => Array.isArray(value)
            ? value.map(desc => mapToType<ProductDescriptions>(desc, productDescriptionKeyMap))
            : []
    },
    images: {
        key: 'produits.produit_images',
        transform: (value) => Array.isArray(value)
            ? value.map(desc => mapToType<ProductImages>(desc, productImageKeyMap))
            : []
    }

}
type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => any;
export const opinionFilter: Record<OpinionFilterTypeAdmin, FilterMappginFunction> = {
    validated: (baseQuery, filter) => {
        const values = (filter.values as string[]).map((val) => {
            if (val === 'Vérifié') return true;
            if (val === 'Non vérifié') return false;
            return undefined;
        }).filter((v) => v !== undefined);
        return baseQuery.in('valide', values);
    },
    actif: (baseQuery, filter) => {
        const values = (filter.values as string[]).map((val) => {
            if (val === 'Visible') return true;
            if (val === 'Non Visible') return false;
            return val;
        });
        return baseQuery.in('actif', values);
    },
    createdAt :(baseQuery, filter) => {
        const value = (filter.values as string[])[0];
        baseQuery.__sortByDate = value === 'La plus ancienne' ? 'asc' : 'desc';
         return baseQuery;
    }
}


export class OpinionRepository implements IOpinionRepository {
    supabase: SupabaseClient;
    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
   

    async readProductOpinion(productId: number): Promise<number | null> {
        const { data, error } = await this.supabase
            .from('avg_notes_par_produit')
            .select('avg_note')
            .eq('id_produit', productId)
            .maybeSingle();

        if (error) {
            throw new NotFoundError(error.message);
        }

        return data?.avg_note ?? null;
    }




    async createOpinion(opinion: Opinion): Promise<Opinion> {
        const { data, error } = await this.supabase.from('avis_produits')
            .insert(opinion)
            .select()
            .single();
        if (error) {
            throw new NotFoundError(error.message);
        }
        if (!data) {
            throw new NotFoundError("Failed to create opinion.");
        }
        return mapToType<Opinion>(data, opinionKeyMap);
    }
    async readOpinionById(id: number): Promise<Opinion> {
        const { data, error } = await this.supabase
            .from('avis_produits')
            .select(`*,clients(nom, prenom,telephone_portable,email, telephone_domicile),produits ( produit_descriptions (titre), produit_images(*))`)
            .eq('id', id)
            .single();
        if (error) {
            throw new NotFoundError(error.message);
        }
        if (!data) {
            throw new NotFoundError(`Product with id ${id} not found`);
        }
        return mapToType<Opinion>(data, opinionKeyMap);

    }

    async updateOpinion(opinion: Opinion): Promise<Opinion> {
        if (!opinion.id) throw new Error("Opinion ID is required for update");


        const { data, error } = await this.supabase
            .from('avis_produits')
            .update({
                titre: opinion.title,
                texte: opinion.text,
                reponse_admin: opinion.responseAdmin,
                valide: opinion.validated,
                actif: opinion.actif,
                note : opinion.rating,

            })
            .eq('id', opinion.id)
            .select(`*`)
            .single();
        if (error) {
            throw new NotFoundError(error.message);
        }



        return mapToType<Opinion>(data, opinionKeyMap);
    }
    async deleteOpinion(id: number): Promise<void> {
        const { error } = await this.supabase
            .from('avis_produits')
            .delete()
            .eq('id', id);
        if (error) {
            throw new NotFoundError(error.message);
        }

    }
    async readOpinionByUserId(userId: number): Promise<Opinion[]> {
        const { data, error } = await this.supabase
            .from("avis_produits")
            .select("*")
            .eq("numero_client", userId);
        if (error) {
            throw new Error(error.message);
        }
        return data ?? [];
    }

    async readOpinionByProductId(productId: number): Promise<Opinion[]> {
        const { data, error } = await this.supabase
            .from("avis_produits")
            .select("*")
            .eq("id_produit", productId);
            
        if (error) {
            throw new Error(error.message);
        }
        if (!data) {
            throw new NotFoundError(`Product with id ${productId} not found`);
        }
        return data.map(opinion => mapToType<Opinion>(opinion, opinionKeyMap));
    }
    async read(options?: OpinionFilter): Promise<ReturnAll<Opinion>> {
        const startOffset = (options?.offset ?? 0) * (options?.limit ?? 10);
        const endOffset = startOffset + ((options?.limit ?? 10) - 1);

        let query = this.supabase
            .from('avis_produits')
            .select(`*, produits ( produit_descriptions (titre),produit_images(*))`, { count: 'exact' })
            .range(startOffset, endOffset);
        
            

        if (options?.search) {
            const searchAsNumber = parseInt(options.search);

            if (!isNaN(searchAsNumber)) {
                query.eq('id', searchAsNumber);
            } else {
                query = this.supabase
                    .from('avis_produits')
                    .select(
                        `*, produits!inner(produit_descriptions!inner(titre))`,
                        { count: 'exact' }
                    )
                    .ilike('produits.produit_descriptions.titre', `%${options.search}%`);
            }
        }

        if (options?.filters) {
            options.filters.forEach((filter) => {
                const fn = opinionFilter[filter.key as OpinionFilterTypeAdmin];
                if (fn) {
                    query = fn(query, filter);
                }
            });
        }
         let sortOrder: 'asc' | 'desc' = 'desc'; // par défaut = plus récente
  const createdAtFilter = options?.filters?.find((f) => f.key === 'createdAt');
  if (createdAtFilter?.values?.[0] === 'La plus ancienne') {
    sortOrder = 'asc';
  }
  query = query.order('date_ajout', { ascending: sortOrder === 'asc' });
        query = query.range(startOffset, endOffset)
        const opinions = await query;
        if (opinions.error) {
            throw new NotFoundError(opinions.error.message);
        }
        return {
            items: opinions?.data ? opinions.data.map(quotation => mapToType<Opinion>(quotation, opinionKeyMap)) : [],
            total: opinions?.count ?? 0,
            count: opinions?.data ? opinions.data.length : 0,
        };
    }
     async addOpinion(input: opinionInput, client: Client): Promise<Opinion> {
        const { data, error } = await this.supabase
             .from('avis_produits')
             .upsert({
                id_produit: input.productId,
                numero_client: client.clientNumber,
                titre: input.title,
                texte: input.text,
                note: input.rating,
                id_modele: input.modelId,
                id_commande:input.commandId,
                email: client.email,
                date_ajout: input.createdAt,
                pseudo: "",
                valide: false,
                actif:false,
             })
             .select()
             .single();
                

        if (error) {
            throw new Error(error.message);
        }

        if (!data) {
            throw new Error("Failed to create opinion.");
        }

        return mapToType<Opinion>(data, opinionKeyMap);
    }


}