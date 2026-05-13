import { Collection, CollectionInput, CollectionProduct } from "../../models/Collection";
import { ProductStatus, ProductWithAdmin } from "../../models/Product";
import { ICollectionRepository } from "../../repositories/ICollectionRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { InternalServerError, NotFoundError } from '../../types/error';
import { KeyMap, mapToType } from './MapToType';
import { productAdminKeyMap } from "./ProductRepository";

export const collectionKeyMap: KeyMap<Collection> = {
    id: 'id',
    name: 'nom',
    active: 'actif',
}

const collectionProductKeyMap: KeyMap<CollectionProduct> = {
    productId: 'id_produit',
    collectionId: 'id_collection',
    product: {
        key: 'produits',
        transform: (value: any) => mapToType<ProductWithAdmin>(value, productAdminKeyMap),
    },
    createdAt: 'created_at',
}


export class CollectionRepository implements ICollectionRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
   

    async readCollection(id: number): Promise<Collection> {
        const { data, error } = await this.supabase.from('collections').select('*').eq('id', id).single();
        if (error) {
            throw new NotFoundError(`Collection with ID ${id} not found`);
        }
        const collection = mapToType<Collection>({
            ...data
        }, collectionKeyMap);
        return collection;
    }

    async readAllCollections(): Promise<Collection[]> {
        const { data, error } = await this.supabase.from('collections').select('*');
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data.map((item) => mapToType<Collection>({
            ...item
        }, collectionKeyMap));
    }

    async createCollection(collection: CollectionInput): Promise<Collection> {
        if(collection.id) {
            const { data, error } = await this.supabase.from('collections').insert({
                id: collection.id,
                nom: collection.name,
                actif: collection.active ? 1 : 0,
            }).select('*').single();
            if (error) {
                throw new InternalServerError(error.message);
            }
            return mapToType<Collection>(data, collectionKeyMap);
        } else {
            const { data, error } = await this.supabase.from('collections').insert({
                nom: collection.name,
                actif: collection.active ? 1 : 0,
            }).select('*').single();

            if (error) {
                throw new InternalServerError(error.message);
            }
            return mapToType<Collection>(data, collectionKeyMap);
        }
    }

    async updateCollection(collection: Collection): Promise<Collection> {
        const { data, error } = await this.supabase.from('collections').update({
            nom: collection.name,
            actif: collection.active ? 1 : 0,
        }).eq('id', collection.id).select('*').single();

        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<Collection>(data, collectionKeyMap);
    }

    async deleteCollection(id: number): Promise<void> {
        const { error } = await this.supabase.from('collections').delete().eq('id', id);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async readAllCollectionProducts(): Promise<CollectionProduct[]> {
        const { data, error } = await this.supabase.from('collection_produits')
        .select('*, produits(*, categories(*), sous_categories(*), marques(*), produit_descriptions(*), produit_images(*))')
        .order('created_at', { ascending: false });
        if (error) {
            throw new InternalServerError(error.message);
        }
        const collectionProducts : CollectionProduct[] = data.map((item) => mapToType<CollectionProduct>(item, collectionProductKeyMap));
        return collectionProducts;
    }

    async createCollectionProduct(collectionProduct: CollectionProduct): Promise<CollectionProduct> {
        const { data, error } = await this.supabase.from('collection_produits').insert({
            id_produit: collectionProduct.productId,
            id_collection: collectionProduct.collectionId,
            created_at: (new Date()).toISOString(),
        }).select('*').single();

        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<CollectionProduct>(data, collectionProductKeyMap);
    }

    async updateCollectionProduct(collectionProduct: CollectionProduct): Promise<CollectionProduct> {
        const { data, error } = await this.supabase.from('collection_produits').update({
            id_produit: collectionProduct.productId,
            id_collection: collectionProduct.collectionId,
            created_at: (new Date()).toISOString(),
        }).eq('id_produit', collectionProduct.productId).eq('id_collection', collectionProduct.collectionId).select('*').single();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return mapToType<CollectionProduct>(data, collectionProductKeyMap);
    }

    async deleteCollectionProduct(productId: number, collectionId: number): Promise<void> {
        const { error } = await this.supabase.from('collection_produits').delete().eq('id_produit', productId).eq('id_collection', collectionId);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async deleteCollectionProductsByCollectionId(collectionId: number): Promise<void> {
        const { error } = await this.supabase.from('collection_produits').delete().eq('id_collection', collectionId);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async readCollectionProductsByCollectionId(collectionId: number): Promise<CollectionProduct[]> {
        const { data, error } = await this.supabase.from('collection_produits')
        .select('*, produits(*, categories(*), sous_categories(*), marques(*), produit_descriptions(*), produit_images(*), produits_admin(*))')
        .eq('id_collection', collectionId)
        .order('created_at', { ascending: false });
        if (error) {
            throw new NotFoundError(error.message);
        }

        const collectionProducts : CollectionProduct[] = data.map((item) => mapToType<CollectionProduct>(item, collectionProductKeyMap));
        return collectionProducts;
    }

    async readCollectionProductsByProductId(productId: number): Promise<CollectionProduct[]> {
        const { data, error } = await this.supabase.from('collection_produits')
        .select('*, produits(*, categories(*), sous_categories(*), marques(*), produit_descriptions(*), produit_images(*))')
        .eq('id_produit', productId)
        .order('created_at', { ascending: false });

        if (error) {
            throw new NotFoundError(error.message);
        }
        const collectionProducts : CollectionProduct[] = data.map((item) => mapToType<CollectionProduct>(item, collectionProductKeyMap));
        return collectionProducts;
    }
    
    async readCollectionProductsByCollectionIdAndProductId(collectionId: number, productId: number): Promise<CollectionProduct> {
        const { data, error } = await this.supabase.from('collection_produits')
        .select('*, produits(*, categories(*), sous_categories(*), marques(*), produit_descriptions(*), produit_images(*))')
        .eq('id_collection', collectionId).eq('id_produit', productId)
        .single();

        if (error) {
            throw new NotFoundError(error.message);
        }

        return mapToType<CollectionProduct>(data, collectionProductKeyMap);
    }
    async readPublishedProductByCollectionId(collectionId: number): Promise<CollectionProduct[]> {
        const { data, error } = await this.supabase.from('collection_produits')
        .select('*, produits(*, categories(*), sous_categories(*), marques(*), produit_descriptions(*), produit_images(*))')
        .eq('id_collection', collectionId)
        .eq('produits.etat_publication', ProductStatus.PUBLISHED) 
        if (error) {
            throw new NotFoundError(error.message);
        }

        const collectionProducts : CollectionProduct[] = data.map((item) => mapToType<CollectionProduct>(item, collectionProductKeyMap));
        return collectionProducts;
    }

}       