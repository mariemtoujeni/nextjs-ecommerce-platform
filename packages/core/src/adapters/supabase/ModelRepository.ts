import { SupabaseClient } from "@supabase/supabase-js";
import { Model, ModelAdmin, ModelAttributValue, ModelFilterInput, ModelUpdate, ModelWithProduct, ReadAllModelsWithProductProps } from "../../models/Model";
import { AttributValue } from "../../models/Attributes";
import { Product, ProductImage, Stock } from "../../models/Product";
import { KeyMap, mapToType } from "./MapToType";
import { BadRequestError, InternalServerError, NotFoundError } from "../../types/error";
import { ReturnAll } from "../../types/utils";
import { bulkInsert } from "./server";
import { productKeyMap } from "./ProductRepository";
import { attributValueKeyMap } from "./AttributRepository";
import { IModelRepository } from "../../repositories/IModelRepository";
import { storeKeyMap } from "./StoreRepository";
import { StockKeyMap } from "./StockRepository";
import { Store } from "../../models/Category";

type ModelProductDetail = {
    name: string;
    attributs: string[];
    price: number;
    image: string;
    codeBar?: string;
    storeNames?: string[];
    stock?: number;
    minStock?: number;
    img?: ProductImage[];
    attributValues?: ModelAttributValue[];
}

const ModelProductDetailKeyMap: KeyMap<ModelProductDetail> = {
    name: 'titre',
    attributs: 'attribut_valeurs',
    price: 'prix_vente_ht',
    image: 'image',
    codeBar: 'code_barre',
    stock: 'stock',
    minStock: 'stock_min'
}

export const modelAttributValueKeyMap: KeyMap<ModelAttributValue> = {
    idModel: 'id_modele',
    idAttributValue: 'id_attribut_valeur',
    attributValue: {
        key: 'attribut_valeurs',
        transform: (value) => mapToType<AttributValue>(value, attributValueKeyMap)
    }
}


export const modelKeyMap: KeyMap<ModelAdmin> = {
    id: 'id',
    productId: 'id_produit',
    weight: 'poids',
    priceWithoutVat: 'prix_vente_ht',
    priceWithVat: 'prix_vente_ttc',
    published: 'publier',
    minStock: 'stock_min',
    purchasePrice: 'modeles_admin.prix_achat_ht',
    barcode: 'modeles_admin.code_barre',
    supplierReference: 'modeles_admin.code_article_fournisseur',
    manufacturerReference: 'modeles_admin.reference_fabricant',
    attributValeurs: 'attribut_valeurs',
    attributValues: {
        key: 'modele_attribut_valeurs',
        transform: (value) => Array.isArray(value)
            ? value.map(attribute => mapToType<ModelAttributValue>(attribute, modelAttributValueKeyMap))
            : []
    }
}

export const modelWithProductKeyMap: KeyMap<ModelWithProduct> = {
    ...modelKeyMap,
    product: {
        key: 'produits',
        transform: (value) => mapToType<Product>(value, productKeyMap)
    },
    stock: {
        key: 'stocks',
        transform: (value) => mapToType<Stock>(value, StockKeyMap)
    }
}


export class ModelRepository implements IModelRepository {
    private supabase: SupabaseClient;
    private readonly MAX_SELECT = 200;

    constructor(supabase: SupabaseClient) 
    {
        this.supabase = supabase;
    }

    async readModelWithProductById(id: number): Promise<ModelWithProduct> {
        const { data, error } = await this.supabase.from('modeles').select('*, produits(*), modeles_admin(*)').eq('id', id).maybeSingle();
        if (error) throw new InternalServerError(error.message);
        return mapToType<ModelWithProduct>(data, modelWithProductKeyMap);
    }

    async readModelProductDetailById(modeleId: number): Promise<ModelProductDetail> {
        // const { data, error } = await this.supabase.from('modeles').select('*, produits(*)').eq('id', id).maybeSingle();
        // if (error) throw new InternalServerError(error.message);
        // return mapToType<ModelProductDetail>(data, ModelProductDetailKeyMap);

        const modelRequest = this.supabase.from('modeles')
            .select('*, produits(*), modele_attribut_valeurs(id_attribut_valeur, attribut_valeurs(nom))')
            .eq('id', modeleId)
            .single();
        const model = await modelRequest;
        
        if(model.error) {
            throw new InternalServerError("Recupération des modeles: " + model.error.message);
        }

        const productDescriptionRequest = this.supabase.from('produit_descriptions')
            .select('titre')
            .eq('id_produit', model.data.produits.id)
            .eq('lang', 'fr')
            .single();
        const productDescription = await productDescriptionRequest;
        
        if(productDescription.error) {
            throw new InternalServerError("Recupération des descriptions: " + productDescription.error.message);
        }

        const productImageRequest = this.supabase.from('produit_images')
            .select('url')
            .eq('id_produit', model.data.produits.id);        
        if(model.data.modele_attribut_valeurs.length === 1) {
            productImageRequest.eq('id_attribut_valeur', model.data.modele_attribut_valeurs[0].id_attribut_valeur);
        } else if(model.data.modele_attribut_valeurs.length > 1) {
            productImageRequest.in('id_attribut_valeur', model.data.modele_attribut_valeurs.map((a: { id_attribut_valeur: number }) => a.id_attribut_valeur));
        }

        const productImage = await productImageRequest;
        if(productImage.error) {
            throw new InternalServerError("Recupération des images: " + productImage.error.message);
        }

        const modelAdminRequest = this.supabase.from('modeles_admin')
            .select('code_barre, id_modele')
            .eq('id_modele', modeleId)
            .single();
        const modelAdmin = await modelAdminRequest;
        
        if(modelAdmin.error) {
            throw new InternalServerError("Recupération des modeles admin: " + modelAdmin.error.message);
        }

        const stockRequest = this.supabase.from('stocks')
            .select('*')
            .eq('id_modele', modeleId)
            .single();
        const stock = await stockRequest;
        
        if(stock.error) {
            throw new InternalServerError("Recupération des stocks: " + stock.error.message);
        }
        
        const modelProductDetail = {
            titre: productDescription.data.titre,
            attribut_valeurs: model.data.modele_attribut_valeurs.map((a: { attribut_valeurs: { nom: string } }) => a.attribut_valeurs.nom),
            prix_vente_ht: model.data.produits.prix_vente_ht,
            image: productImage.data && productImage.data.length > 0 ? `/api/assets/${productImage.data[0]?.url}` : '',
            code_barre: modelAdmin.data.code_barre,
            stock: stock.data.stock,
            stock_min: model.data.stock_min
        }

        return mapToType<ModelProductDetail>(modelProductDetail, ModelProductDetailKeyMap);
    }


    async readModelById(id: number): Promise<Model> {
        const { data, error } = await this.supabase.from('modeles').select('*').eq('id', id).maybeSingle();
        if (error) throw new InternalServerError(error.message);
        return mapToType<Model>(data, modelKeyMap);
    }

    async readModelsByIds(ids: number[]): Promise<Model[]> {
        const { data, error } = await this.supabase.from('modeles').select('*').in('id', ids);
        if (error) throw new InternalServerError(error.message);
        return data.map(model => mapToType<Model>(model, modelKeyMap));
    }

    async readByBarcodes(barcodes: string[]): Promise<ModelAdmin[]> {
        let idx = 0;
        const results: ModelAdmin[] = [];
        
        do {
            const end = Math.min((idx + 1) * this.MAX_SELECT, (idx * this.MAX_SELECT) + (barcodes.length - (idx * this.MAX_SELECT)));
            const { data, error } = await this.supabase
                .from('modeles')
                .select('*, modeles_admin!inner(*)')
                .in('modeles_admin.code_barre', barcodes.slice(idx*this.MAX_SELECT, end));

            if (error) 
                throw new BadRequestError(error.message);

            results.push(...data.map(model => mapToType<ModelAdmin>(model, modelKeyMap)));
            idx++;
        
        } while(idx*this.MAX_SELECT < barcodes.length);

        return results;
    }

    async readByBarcode(barcode: string): Promise<ModelAdmin> {
        const { data, error } = await this.supabase
            .from('modeles')
            .select('*, modeles_admin!inner(*)')
            .eq('modeles_admin.code_barre', barcode)
            .single();
            
        if (error) {
            throw new BadRequestError(error.message);
        }
        const result = mapToType<ModelAdmin>(data, modelKeyMap);
        return result;
    }


    async bulkUpdateStock(models: ModelAdmin[]): Promise<void> {
        const data = models.map(model => ({
            id: model.id,
            stock_min: model.minStock,
            poids: model.weight,
            prix_vente_ht: model.priceWithoutVat,
            prix_vente_ttc: model.priceWithVat,
            publier: model.published,
        }))
        
        const result = await bulkInsert(this.supabase, {
            table: 'modeles',
            data: data
        })

        if(!result.success) {
            throw new BadRequestError(result.errors.join(', '));
        }
    }

    async readModelsWithProductByShopId(shopId: number, options: ModelFilterInput): Promise<ReturnAll<ModelWithProduct>> {
        let shopModels = [];
        const shopLines = await this.supabase
            .from('point_vente_lignes')
            .select('*')
            .eq('id_point_vente', shopId);

        if(shopLines.error || !shopLines.data || shopLines.data.length === 0) {
            return {
                items: [],
                total: 0,
                count: 0
            };
        } else {
            shopModels = shopLines.data.map((shopLine: any) => shopLine.id_modele);
        }

        const startOffset = (options.offset ?? 0) * (options.limit ?? 50);
        const endOffset = startOffset + (options.limit ?? 50) - 1;

        let foundIdModel = 0;
        const baseModelAdminQueryCond = this.supabase
            .from('modeles_admin')
            .select('*');

        if(options.search) {
            const searchRequest = options.search;            
            baseModelAdminQueryCond.or(`code_barre.eq.${searchRequest},reference_fabricant.eq.${searchRequest},code_article_fournisseur.eq.${searchRequest}`);
            const modelesAdminCond = await baseModelAdminQueryCond.single();

            if(modelesAdminCond.error) {
                console.error(modelesAdminCond.error);
            }
            
            if(modelesAdminCond.data) {
                foundIdModel = modelesAdminCond.data.id_modele;
            }
        }        

        const baseQuery =  this.supabase
            .from('modeles')
            .select('*, modeles_admin!inner(*), produits!inner(*, categories(*), sous_categories(*), marques(*), produit_descriptions!inner(*)\
          , produit_images(*))', { count: 'exact' })
            .range(startOffset, endOffset)
            .order('id', { ascending: options.sort === 'asc' });

        if(foundIdModel > 0) {            
            baseQuery.eq('id', foundIdModel);
        } else if(options.search) {
            try {
                const searchRequest = parseInt(options.search);
                if(!isNaN(searchRequest) && searchRequest > 0 && searchRequest < 100000) {
                    baseQuery.eq('id', searchRequest);
                } else if(isNaN(searchRequest)) {
                    baseQuery.ilike('produits.produit_descriptions.titre', `%${options.search}%`);
                }
            } catch (error) {
                console.error(error);
            }
        }

        if(shopModels.length > 0) {
            baseQuery.in('id', shopModels);
        }

        const models = await baseQuery;

        if (models.error) {
            throw new NotFoundError(models.error.message);
        }

        // If no models found, return empty result
        if (!models.data || models.data.length === 0) {
            return {
                items: [],
                total: 0,
                count: 0
            };
        }

        const { data: attributValues, error: attributValuesError } = await this.supabase
            .from('modele_attribut_valeurs')
            .select('*, attribut_valeurs(*)')
            .in('id_modele', models.data.map((model: any) => model.id));
        if (attributValuesError) {
            console.error(attributValuesError);
        }

        const { data: modelesAdmin, error: modelesAdminError } = await this.supabase
            .from('modeles_admin')
            .select('*')
            .in('id_modele', models.data.map((model: any) => model.id));
        if(modelesAdminError) {
            console.error(modelesAdminError);
        }

        const modelesToReturn = models?.data ? models.data.map((model :  any, index: number) => {
            const itemToParse = {
                ...model,
                id: model.id,
                id_produit: model.id_produit,
                poids: model.poids,
                prix_vente_ht: model.prix_vente_ht,
                prix_vente_ttc: model.prix_vente_ttc,
                publier: model.publier,
                stock_min: model.stock_min,
                produits: {
                    ...model.produits,
                    id: model.produits.id,
                    is_pack: model.produits.is_pack,
                    personnalisation: model.produits.personnalisation,
                    id_categorie: model.produits.id_categorie,
                    categories: {
                        ...model.produits.categories,
                        id_categorie: model.produits.categories.id_categorie,
                        name: model.produits.categories.nom,
                    },
                    id_sous_categories: model.produits.id_sous_categories,
                    sous_categories: {
                        ...model.produits.sous_categories,
                        id: model.produits.sous_categories.id,
                        name: model.produits.sous_categories.nom,
                    },                    
                    id_marque: model.produits.id_marque,
                    brand: {
                        ...model.produits.marques,
                        id: model.produits.marques.id,
                        nom: model.produits.marques.nom,
                    },
                    prix_vente_ht: model.produits.prix_vente_ht,
                    prix_vente_ttc: model.produits.prix_vente_ttc,
                    tva: model.produits.tva,
                    poids: model.produits.poids,
                    cheque_cadeau: model.produits.cheque_cadeau,
                    cheque_duree: model.produits.cheque_duree,
                    etat_publication: model.produits.etat_publication,
                    stock_min: model.produits.stock_min,
                    created_at: model.produits.created_at,
                    updated_at: model.produits.updated_at,
                    descriptions: {
                        ...model.produits.produit_descriptions,
                        id: model.produits.produit_descriptions.id,
                        titre: model.produits.produit_descriptions.titre,
                        description: model.produits.produit_descriptions.description,
                    },
                    produit_images: [
                        ...model.produits.produit_images,
                    ]
                },
                modeles_admin: modelesAdmin?.find(ma => ma.id_modele === model.id) ?? {},
                attribut_valeurs: attributValues?.filter(av => av.id_modele === model.id) ?? []
            }
            const mappedItem = mapToType<ModelWithProduct>(itemToParse, modelWithProductKeyMap);
            return mappedItem;
        }) : [];

        

        return {
            items: modelesToReturn,
            total: models?.count ?? 0,
            count: models?.data ? models.data.length : 0,
        };
    }

    async readAllModelsWithProduct(props: ReadAllModelsWithProductProps): Promise<ReturnAll<ModelWithProduct>> {
        const { options, modelIds, brandId } = props;
        const { limit = 50, offset = 0, sort, search, filters } = options;
        const startOffset = (offset ?? 0) * (limit ?? 50);
        const endOffset = startOffset + (limit ?? 50) - 1;

        let foundIdModel: number[] = [];
        let foundIdProduct: number[] = [];
        const baseModelAdminQueryCond = this.supabase
            .from('modeles_admin')
            .select('*');

        const baseProuctAdminQueryCond = this.supabase
            .from('produits_admin')
            .select('*');
        
        if(options.search) {
            const searchRequest = options.search;            
            baseModelAdminQueryCond.or(`code_barre.eq.${searchRequest},reference_fabricant.eq.${searchRequest},code_article_fournisseur.eq.${searchRequest}`);
            baseProuctAdminQueryCond.or(`reference_fabricant.eq.${searchRequest}`);
            const modelesAdminCond = await baseModelAdminQueryCond;
            const produitsAdminCond = await baseProuctAdminQueryCond;

            if(modelesAdminCond.error) {
                console.log(modelesAdminCond.error);
            }
         
            if(modelesAdminCond.data && modelesAdminCond.data.length > 0) {                
                foundIdModel = modelesAdminCond.data.map((item: any) => item.id_modele);
            }

            if(produitsAdminCond.data && produitsAdminCond.data.length > 0) {                
                foundIdProduct = produitsAdminCond.data.map((item: any) => item.id_produit);
            }
        }
        
        const baseQuery =  this.supabase
            .from('modeles')
            .select('*, stocks!inner(*), modele_attribut_valeurs(*, attribut_valeurs(*)), modeles_admin!inner(*), produits!inner(*, categories(*), sous_categories(*), marques(*), produit_descriptions!inner(*))', { count: 'exact' })
            .range(startOffset, endOffset)
            .order('id', { ascending: options.sort === 'asc' });

        if(modelIds && modelIds.length > 0) {
            baseQuery.in('id', modelIds);
        }

        if(brandId) {
            baseQuery.eq('produits.id_marque', brandId);
        }

        if(foundIdModel.length > 0) {
            baseQuery.in('id', foundIdModel);
        }   
        else if(foundIdProduct.length > 0) {
            baseQuery.in('id_produit', foundIdProduct);
        }
        else if(options.search) {
            try {
                const searchRequest = parseInt(options.search);
                if(!isNaN(searchRequest) && searchRequest > 0 && searchRequest < 100000) {
                    baseQuery.eq('id', searchRequest);
                } else if(isNaN(searchRequest)) {
                    baseQuery.ilike('produits.produit_descriptions.titre', `%${options.search}%`);
                }
            } catch (error) {
                console.error(error);
            }
        }

        const models = await baseQuery;

        if (models.error) {
            throw new NotFoundError(models.error.message);
        }

        // If no models found, return empty result
        if (!models.data || models.data.length === 0) {
            return {
                items: [],
                total: 0,
                count: 0
            };
        }

        const { data: attributValues, error: attributValuesError } = await this.supabase
            .from('modele_attribut_valeurs')
            .select('*, attribut_valeurs(*)')
            .in('id_modele', models.data.map((model: any) => model.id));
        if (attributValuesError) {
            console.error(attributValuesError);
        }

        const { data: modelesAdmin, error: modelesAdminError } = await this.supabase
            .from('modeles_admin')
            .select('*')
            .in('id_modele', models.data.map((model: any) => model.id));
        if(modelesAdminError) {
            console.error(modelesAdminError);
        }

        const { data: produitsAdmin, error: produitsAdminError } = await this.supabase
            .from('produits_admin')
            .select('*')
            .in('id_produit', models.data.map((model: any) => model.id_produit));
        if(produitsAdminError) {
            console.error(produitsAdminError);
        }

        const { data: produitImages, error: produitImagesError } = await this.supabase
            .from('produit_images')
            .select('*')
            .in('id_produit', models.data.map((model: any) => model.id_produit));
        if(produitImagesError) {
            console.error(produitImagesError);
        }

        const { data: produitsMagasins, error: produitsMagasinsError } = await this.supabase
            .from('produit_magasins')
            .select('*')
            .in('id_produit', models.data.map((model: any) => model.id_produit));
        if(produitsMagasinsError) {
            console.error(produitsMagasinsError);
        }

        const produitsMagasinsMap = new Map<number, Store[]>(); // id_produit -> Store        
        if(produitsMagasins && produitsMagasins.length > 0) {
            const { data: magasins, error: magasinsError } = await this.supabase
                .from('magasins')
                .select('*')
                .in('id', produitsMagasins?.map((produitMagasin: any) => produitMagasin.id_magasin))
                .eq('actif', 1);
            if(magasinsError) {
                console.error(magasinsError);
            }

            const stores : Store[] = magasins?.map((magasin: any) => mapToType<Store>(magasin, storeKeyMap)) ?? [];
            produitsMagasins.forEach((produitMagasin: any) => {
                const store = stores.find((store: Store) => store.id === produitMagasin.id_magasin);                
                if(store) {
                    produitsMagasinsMap.set(produitMagasin.id_produit, [...(produitsMagasinsMap.get(produitMagasin.id_produit) ?? []), store]);
                }
            });
        }

        

        const modelesToReturn = models?.data ? models.data.map((model :  any, index: number) => {
            let imagesProduct =  [
                ...produitImages?.filter(pi => pi.id_produit === model.id_produit)
                    .filter(pi => (attributValues?.filter(av => av.id_modele === model.id) ?? [])
                    .some(av => av.id_attribut_valeur === pi.id_attribut_valeur)) ?? [],
            ];
            if(imagesProduct.length === 0) {
                imagesProduct = [
                    ...produitImages?.filter(pi => pi.id_produit === model.id_produit) ?? [],
                ]
            }
            const itemToParse = {
                ...model,
                id: model.id,
                id_produit: model.id_produit,
                poids: model.poids,
                prix_vente_ht: props.flag === 'purchase-order' ? modelesAdmin && modelesAdmin.find(ma => ma.id_modele === model.id) ? modelesAdmin?.find(ma => ma.id_modele === model.id).prix_achat_ht : 0 : model.prix_vente_ht.toFixed(2), 
                prix_vente_ttc: props.flag === 'purchase-order' ? modelesAdmin && modelesAdmin.find(ma => ma.id_modele === model.id) ? modelesAdmin?.find(ma => ma.id_modele === model.id).prix_achat_ht * (1 + model.produits.tva / 100) : 0 : model.prix_vente_ttc.toFixed(2),
                publier: model.publier,
                stock_min: model.stock_min,                
                produits: {
                    ...model.produits,
                    id: model.produits.id,
                    is_pack: model.produits.is_pack,
                    personnalisation: model.produits.personnalisation,
                    id_categorie: model.produits.id_categorie,
                    magasins: produitsMagasinsMap.get(model.id_produit)?.map((store: Store) => {
                        return {
                            id: store.id,
                            nom: store.name,
                            actif: store.active,
                        }
                    }) ?? [],
                    categories: {
                        ...model.produits.categories,
                        id_categorie: model.produits.categories.id_categorie,
                        name: model.produits.categories.nom,
                    },
                    id_sous_categories: model.produits.id_sous_categories,
                    sous_categories: {
                        ...model.produits.sous_categories,
                        id: model.produits.sous_categories.id,
                        name: model.produits.sous_categories.nom,
                    },                    
                    id_marque: model.produits.id_marque,
                    brand: {
                        ...model.produits.marques,
                        id: model.produits.marques.id,
                        nom: model.produits.marques.nom,
                    },
                    prix_vente_ht: props.flag === 'purchase-order' ? produitsAdmin && produitsAdmin.find(pa => pa.id_produit === model.id_produit) ? produitsAdmin?.find(pa => pa.id_produit === model.id_produit).prix_achat_ht : 0 : model.produits.prix_vente_ht.toFixed(2),
                    prix_vente_ttc: props.flag === 'purchase-order' ? produitsAdmin && produitsAdmin.find(pa => pa.id_produit === model.id_produit) ? produitsAdmin?.find(pa => pa.id_produit === model.id_produit).prix_achat_ht * (1 + model.produits.tva / 100) : 0 : model.produits.prix_vente_ttc.toFixed(2),
                    tva: model.produits.tva,
                    poids: model.produits.poids,
                    cheque_cadeau: model.produits.cheque_cadeau,
                    cheque_duree: model.produits.cheque_duree,
                    etat_publication: model.produits.etat_publication,
                    stock_min: model.produits.stock_min,
                    created_at: model.produits.created_at,
                    updated_at: model.produits.updated_at,
                    descriptions: {
                        ...model.produits.produit_descriptions,
                        id: model.produits.produit_descriptions.id,
                        titre: model.produits.produit_descriptions.titre,
                        description: model.produits.produit_descriptions.description,
                    },
                    produit_images: imagesProduct
                },
                modeles_admin: modelesAdmin?.find(ma => ma.id_modele === model.id) ?? {},
                attribut_valeurs: attributValues?.filter(av => av.id_modele === model.id) ?? [],
                stocks: model.stocks
            }
            const mappedItem = mapToType<ModelWithProduct>(itemToParse, modelWithProductKeyMap);
            return mappedItem;
        }) : [];

        return {
            items: modelesToReturn,//models.data.map((model: any) => mapToType<ModelWithProduct>(model, modelWithProductKeyMap)),
            total: models?.count ?? 0,
            count: modelesToReturn.length
        };
    }

    async create(model: Omit<ModelAdmin, "id" | "attributValeurs">): Promise<ModelAdmin> {
        const modelData = await this.supabase
            .from('modeles')
            .insert({
                id_produit: model.productId,
                poids: model.weight,
                prix_vente_ht: model.priceWithoutVat,
                prix_vente_ttc: model.priceWithVat,
                publier: true,
                stock_min: model.minStock,
            })
            .select()
            .single();

        if (modelData.error) {
            throw new BadRequestError(modelData.error.message);
        }

        const modelAdminData = await this.supabase
            .from('modeles_admin')
            .insert({
                id_modele: modelData.data.id,
                prix_achat_ht: model.purchasePrice,
                code_barre: "",
                code_article_fournisseur: "",
                reference_fabricant: "",
            })
            .select()
            .single();
        return {
            id: modelData.data.id,
            ...modelData.data,
            ...modelAdminData.data,
            attributValues: [],
        }
    }
    
    async createAttribute(modelId: number, attributeValueId: number): Promise<void> {
        const { error } = await this.supabase
            .from('modele_attribut_valeurs')
            .insert({
                id_modele: modelId,
                id_attribut_valeur: attributeValueId,
            });
        if (error) {
            throw new BadRequestError(error.message);
        }
    }

    async update(id: number, update: ModelUpdate): Promise<void> {
        //fresh vat query before model update
        const { data: modelData, error: fetchError } = await this.supabase
            .from('modeles')
            .select('id_produit')
            .eq('id', id)
            .single();

        if (fetchError || !modelData) {
            throw new NotFoundError(`Model with id ${id} not found: ${fetchError?.message}`);
        }

        const productId = modelData.id_produit;

        const { data: productData, error: productError } = await this.supabase
            .from('produits')
            .select('tva')
            .eq('id', productId)
            .single();

        if (productError || !productData) {
            throw new NotFoundError(`Product with id ${productId} not found: ${productError?.message}`);
        }

        const vatRate = productData.tva;
        const modelUpdate = await this.supabase
            .from('modeles')
            .update({
                poids: update.weight,
                prix_vente_ht: update.priceWithoutVat,
                prix_vente_ttc: update.priceWithoutVat * (1 + vatRate / 100),
                publier: update.published,
                stock_min: update.minStock,
            })
            .eq('id', id);

        if (modelUpdate.error) {
            throw new BadRequestError(modelUpdate.error.message);
        }

        const modelAdminUpdate = await this.supabase
            .from('modeles_admin')
            .update({
                prix_achat_ht: update.purchasePrice,
                code_barre: update.barcode,
                code_article_fournisseur: update.supplierReference,
                reference_fabricant: update.manufacturerReference,
            })
            .eq('id_modele', id);
        if (modelAdminUpdate.error) {
            throw new BadRequestError(modelAdminUpdate.error.message);
        }
    }
}