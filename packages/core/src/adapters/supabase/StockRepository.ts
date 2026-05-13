import { Stock, StockFilterType, StockInput, StockFilterInput, StockPresenter, ProductImage } from "../../models/Product";
import { IStockRepository } from "../../repositories/IStockRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { BadRequestError, InternalServerError, NotFoundError } from "../../types/error";
import { ActiveFilter, ReturnAll } from "../../types/utils";
import { KeyMap, mapFromType, mapToType } from "./MapToType";
import { ModelAttributValue, ModelStockUpdate } from "../../models/Model";

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

export const StockKeyMap: KeyMap<Stock> = {
    idModel: 'id_modele',
    locked: 'bloque',
    indisponible: 'indisponible',
    disponible: 'disponible',
    updatedAt: 'updated_at'
}

export const StockPresenterKeyMap: KeyMap<StockPresenter> = {
    idModel: 'id_modele',
    locked: 'bloque',
    indisponible: 'indisponible',
    disponible: 'disponible',
    updatedAt: 'updated_at',
    published: 'publier',
    model: {
        key: 'modeles',
        transform: (value) => mapToType<ModelProductDetail>(value, ModelProductDetailKeyMap)
    }
}

type StockMappginFunction = (baseQuery: any, filter: ActiveFilter) => any;
export const stockFilter: Record<StockFilterType, StockMappginFunction> = {
    [StockFilterType.STATUS]: (baseQuery, filter) => {
        const values = (filter.values as string[]).map(value => value.toLowerCase());        
        if(values.includes('disponible')) {
            baseQuery = baseQuery.gt('disponible', 0);
        }
        if(values.includes('indisponible')) {
            baseQuery = baseQuery.gt('indisponible', 0);
        }
        if(values.includes('bloque')) {
            baseQuery = baseQuery.gt('bloque', 0);
        }
        return baseQuery;
    },
    [StockFilterType.PUBLISHED]: (baseQuery, filter) => {        
        return baseQuery;
    }
}


export class StockRepository implements IStockRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async updateModelStocks(updates: ModelStockUpdate[]): Promise<void> {
        if (!updates || updates.length === 0) {
            throw new BadRequestError("No stock updates provided");
        }

        const rows = updates.map(update => ({
            id_modele: update.modelId,
            disponible: update.quantity
        }));

        const { error } = await this.supabase
            .from("stocks")
            .upsert(rows, { onConflict: "id_modele" });

        if (error) {
            throw new InternalServerError(error.message);
        }
    }


    async createStock(modelId: number): Promise<Stock> {
        const { data, error } = await this.supabase.from('stocks').insert({
            id_modele: modelId,
            bloque: 0,
            indisponible: 0,
            disponible: 0
        }).select("*").single();
        if (error) throw new InternalServerError(error.message);
        return mapToType<Stock>(data, StockKeyMap);
    }

    async readStockById(id: number): Promise<Stock> {
        const { data, error } = await this.supabase
            .from('stocks')
            .select('*', { count: 'exact' })
            .eq('id_modele', id)
            .single();

        if (error) {
            throw new NotFoundError("Stock not found");
        }

        return mapToType<Stock>(data, StockKeyMap);
    }

    async commonScriptForStocks(models: any, stocks: any, modelAdmins: any): Promise<StockPresenter[]> {
        // Créer des maps pour un accès rapide
        const modelMap = new Map(models.map((model: any) => [model.id, model]));
        const modelAdminMap = new Map(modelAdmins.map((admin: any) => [admin.id_modele, admin]));

        // Récupérer tous les produits IDs pour les images
        const productIds = Array.from(new Set(models.map((model: any) => model.produits?.id).filter(Boolean)));        
        const attributValeurIds = models
            .flatMap((model: any) => model.modele_attribut_valeurs?.map((av: { id_attribut_valeur: number }) => av.id_attribut_valeur) || [])
            .filter(Boolean);

        // Récupérer toutes les images en parallèle
        let imagesRequest = this.supabase.from('produit_images')
            .select('id_produit, id_attribut_valeur, url')
            .in('id_produit', productIds);

        if (attributValeurIds.length > 0) {
            imagesRequest = imagesRequest.in('id_attribut_valeur', attributValeurIds);
        }

        const imagesResult = await imagesRequest;        
        if (imagesResult.error) {
            throw new InternalServerError(imagesResult.error.message);
        }

        const images = imagesResult.data || [];        
        const imageMap = new Map();
        
        // Créer un map des images par produit et attribut
        images.forEach(image => {
            const key = `${image.id_produit}_${image.id_attribut_valeur ? image.id_attribut_valeur : ''}`;
            if (!imageMap.has(key)) {
                imageMap.set(key, image.url);
            }
        });

        const stocksWithModel = [];
        for (const stock of stocks) {
            try {
                const model: any = modelMap.get(stock.id_modele);
                if (
                    !model ||
                    typeof model !== 'object' ||
                    !model.produits ||
                    !Array.isArray(model.produits.produit_descriptions) ||
                    model.produits.produit_descriptions.length === 0
                ) {                    
                    continue;
                };

                const modelAdmin: any = modelAdminMap.get(stock.id_modele);
                if (!modelAdmin) continue;
                const codeBar = modelAdmin?.code_barre;

                // Trouver l'image correspondante avec une fonction lambda
                const findImage = (model: any, imageMap: Map<string, string>) => {                    
                    if (model.produits?.id && model.modele_attribut_valeurs?.length > 0) {
                        for(const attribut of model.modele_attribut_valeurs) {
                            const key = `${model.produits.id}_${attribut.id_attribut_valeur}`;
                            const image = imageMap.get(key);
                            if(image) {
                                return image;
                            }
                        }
                        return undefined;
                    }
                    return imageMap.get(`${model.produits.id}_`) ?? undefined;                    
                };

                const image = findImage(model, imageMap);

                stocksWithModel.push({
                    ...stock,
                    publier: model.publier,
                    modeles: {
                        titre: model.produits?.produit_descriptions?.[0]?.titre,
                        code_barre: codeBar,
                        prix_vente_ht: model.produits?.prix_vente_ht,
                        image: image ? `/api/assets/${image}` : undefined,
                        attribut_valeurs: model.modele_attribut_valeurs?.map((attribut: any) => attribut.attribut_valeurs.nom) || []
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }

        const stocksWithModel_ = stocksWithModel.map((item) => mapToType<StockPresenter>(item, StockPresenterKeyMap));
        return stocksWithModel_;
    }

    async listStockByModelIds(modelIds: number[]): Promise<Stock[]> {
        const { data, error } = await this.supabase
            .from('stocks')
            .select('*')
            .in('id_modele', modelIds);
        if (error) {
            throw new NotFoundError(error.message);
        }
        return data.map((item) => mapToType<Stock>(item, StockKeyMap));
    }

    async listStocks(options?: StockFilterInput): Promise<ReturnAll<StockPresenter>> {
        const { limit, offset, sort, search, filters } = options || {};
        const startOffset = (offset ?? 0) * (limit ?? Number.MAX_SAFE_INTEGER);
        const endOffset = startOffset + (limit ?? Number.MAX_SAFE_INTEGER) - 1;
        const filterPublished = filters?.find(filter => filter.key === StockFilterType.PUBLISHED);

        if(search && typeof search === 'string' && search.trim() !== '') {
            const searchNumber = parseInt(search);
            if (Number.isNaN(searchNumber)) {     
                const produit_descriptionsRequest = this.supabase.from('produit_descriptions')
                    .select('id_produit, titre, lang')
                    .eq('lang', 'fr')
                    .ilike('titre', `%${search}%`);
                    

                const { data: produit_descriptions, error: errorProduitDescriptions, count: countProduitDescriptions } = await produit_descriptionsRequest.order('id_produit', { ascending: sort === 'asc' });
                if (errorProduitDescriptions) {
                    throw new NotFoundError(errorProduitDescriptions.message);
                }

                const produit_descriptions_map = new Map(produit_descriptions.map((prod_desc: any) => [prod_desc.id_produit, prod_desc]));
                if(produit_descriptions_map.size === 0) {
                    return {
                        items: [],
                        total: countProduitDescriptions ?? 0,
                        count: 0
                    };
                }
                const produitIds = produit_descriptions.map(pd => pd.id_produit);

                let requestModel = this.supabase.from('modeles')
                    .select('*, produits(id, prix_vente_ht, tva, produit_descriptions(titre, lang)), modele_attribut_valeurs(id_attribut_valeur,attribut_valeurs(nom))')
                    .in('id_produit', produitIds);

                if (filterPublished && Array.isArray(filterPublished.values)) {
                    if ((filterPublished.values as string[]).includes('PUBLIE')) {
                        requestModel = requestModel.eq('publier', true);
                    } 
                    if ((filterPublished.values as string[]).includes('NON_PUBLIE')) {
                        requestModel = requestModel.eq('publier', false);
                    }
                }
                
                requestModel = requestModel.range(startOffset, endOffset);

                const modelsObject = await requestModel.order('id', { ascending: sort === 'asc' });
                if (modelsObject.error) {
                    throw new NotFoundError(modelsObject.error.message);
                }                   

                let models = modelsObject.data.map((model: any) => {
                    const produit_description = produit_descriptions_map.get(model.id_produit);
                    if(produit_description) {
                        model.produits.produit_descriptions = [produit_description];
                    }
                    return model;
                }) || [];
                const countModels = modelsObject.count;

                if (models.length === 0) {
                    return {
                        items: [],
                        total: countModels ?? 0,
                        count: 0
                    };
                }

                const modelIds = models.map(model => model.id);

                let requestStock = this.supabase.from('stocks')
                    .select('*', { count: 'exact' })
                    .in('id_modele', modelIds);
                
                if (filters) {      
                    filters.forEach(filter => {
                        const filterKey = filter.key as StockFilterType;
                        if (stockFilter[filterKey]) {
                            requestStock = stockFilter[filterKey](requestStock, filter);
                        }
                    });
                }
    
                const { data: stocks, error: errorStocks, count } = await requestStock.order('id_modele', { ascending: sort === 'asc' });
                if (errorStocks) {
                    throw new NotFoundError(errorStocks.message);
                }

                if (stocks.length === 0) {
                    return {
                        items: [],
                        total: count ?? 0,
                        count: 0
                    };
                }

                let modelAdminRequest = this.supabase.from('modeles_admin')
                    .select('id_modele, code_barre', { count: 'exact' })
                    .in('id_modele', modelIds);

                const { data: modelAdmins, error: errorModelAdmins, count: countModelAdmins } = await modelAdminRequest.order('id_modele', { ascending: sort === 'asc' });
                if (errorModelAdmins) {
                    console.log("errorModelAdmins : ", errorModelAdmins);
                    throw new NotFoundError(errorModelAdmins.message);
                }
                
                const stocksWithModel = await this.commonScriptForStocks(models, stocks, modelAdmins);
                return {
                    items: stocksWithModel,
                    total: count ?? stocksWithModel.length, 
                    count: stocksWithModel.length
                };
            }   else {
                let modelAdminRequest = this.supabase.from('modeles_admin')
                    .select('id_modele, code_barre', { count: 'exact' })
                    .ilike('code_barre', `%${search}%`);

                modelAdminRequest = modelAdminRequest.range(startOffset, endOffset);

                const { data: modelAdmins, error: errorModelAdmins, count: countModelAdmins } = await modelAdminRequest.order('id_modele', { ascending: sort === 'asc' });
                if (errorModelAdmins) {
                    throw new NotFoundError(errorModelAdmins.message);
                }

                const modelIds = modelAdmins.map(model => model.id_modele);
                if(modelIds.length === 0) {
                    return {
                        items: [],
                        total: countModelAdmins ?? 0,
                        count: 0
                    };
                }

                let requestStock = this.supabase.from('stocks')
                    .select('*', { count: 'exact' })
                    .in('id_modele', modelIds);

                if (filters) {      
                    filters.forEach(filter => {
                        const filterKey = filter.key as StockFilterType;
                        if (stockFilter[filterKey]) {
                            requestStock = stockFilter[filterKey](requestStock, filter);
                        }
                    });
                }

                const { data: stocks, error: errorStocks, count } = await requestStock.order('id_modele', { ascending: sort === 'asc' });
                if (errorStocks) {
                    throw new NotFoundError(errorStocks.message);
                }

                // Requêtes parallèles pour récupérer tous les modèles, codes-barres et images
                let requestModel = this.supabase.from('modeles')
                    .select('*, produits(id, prix_vente_ht, tva, produit_descriptions(titre, lang)), modele_attribut_valeurs(id_attribut_valeur,attribut_valeurs(nom))')
                    .in('id', modelIds);

                if (filterPublished && Array.isArray(filterPublished.values)) {
                    if ((filterPublished.values as string[]).includes('PUBLIE')) {
                        requestModel = requestModel.eq('publier', true);
                    } 
                    if ((filterPublished.values as string[]).includes('NON_PUBLIE')) {
                        requestModel = requestModel.eq('publier', false);
                    }
                }
                

                const { data: models, error: errorModels, count: countModels } = await requestModel.order('id', { ascending: sort === 'asc' });
                if (errorModels) {
                    throw new NotFoundError(errorModels.message);
                }

                const produitIds = models.map(model => model.id_produit);

                const produit_descriptionsRequest = this.supabase.from('produit_descriptions')
                    .select('id_produit, titre, lang')
                    .eq('lang', 'fr')
                    .in('id_produit', produitIds);
                    

                const { data: produit_descriptions, error: errorProduitDescriptions, count: countProduitDescriptions } = await produit_descriptionsRequest.order('id_produit', { ascending: sort === 'asc' });
                if (errorProduitDescriptions) {
                    throw new NotFoundError(errorProduitDescriptions.message);
                }

                const produit_descriptions_map = new Map(produit_descriptions.map((prod_desc: any) => [prod_desc.id_produit, prod_desc]));
                if(produit_descriptions_map.size === 0) {
                    return {
                        items: [],
                        total: countProduitDescriptions ?? 0,
                        count: 0
                    };
                }

                const models_ = models.map((model: any) => {
                    const produit_description = produit_descriptions_map.get(model.id_produit);
                    if(produit_description) {
                        model.produits.produit_descriptions = [produit_description];
                    }
                    return model;
                });

                const stocksWithModel = await this.commonScriptForStocks(models_, stocks, modelAdmins);
                return {
                    items: stocksWithModel,
                    total: count ?? stocksWithModel.length, 
                    count: stocksWithModel.length
                };
            }
        }   else if (filterPublished && Array.isArray(filterPublished.values)) {
            let requestModel = this.supabase.from('modeles')
                .select('*, produits(id, prix_vente_ht, tva, produit_descriptions(titre, lang)), modele_attribut_valeurs(id_attribut_valeur,attribut_valeurs(nom))')
            
            if ((filterPublished.values as string[]).includes('PUBLIE')) {
                requestModel = requestModel.eq('publier', true);
            } 
            if ((filterPublished.values as string[]).includes('NON_PUBLIE')) {
                requestModel = requestModel.eq('publier', false);
            }

            requestModel = requestModel.range(startOffset, endOffset);

            const { data: models, error: errorModels, count: countModels } = await requestModel.order('id', { ascending: sort === 'asc' });
            if (errorModels) {
                throw new NotFoundError(errorModels.message);
            }

            if (models.length === 0) {
                return {
                    items: [],
                    total: countModels ?? 0,
                    count: 0
                };
            }

            const modelIds = models.map(model => model.id);
            const produitIds = models.map(model => model.id_produit);

            const produit_descriptionsRequest = this.supabase.from('produit_descriptions')
                .select('id_produit, titre, lang')
                .eq('lang', 'fr')
                .in('id_produit', produitIds);
                

            const { data: produit_descriptions, error: errorProduitDescriptions, count: countProduitDescriptions } = await produit_descriptionsRequest.order('id_produit', { ascending: sort === 'asc' });
            if (errorProduitDescriptions) {
                throw new NotFoundError(errorProduitDescriptions.message);
            }

            const produit_descriptions_map = new Map(produit_descriptions.map((prod_desc: any) => [prod_desc.id_produit, prod_desc]));
            const models_ = models.map((model: any) => {
                const produit_description = produit_descriptions_map.get(model.id_produit);
                if(produit_description) {
                    model.produits.produit_descriptions = [produit_description];
                }
                return model;
            });

            let requestStock = this.supabase.from('stocks')
                .select('*', { count: 'exact' })
                .in('id_modele', modelIds);

            if (filters) {      
                filters.forEach(filter => {
                    const filterKey = filter.key as StockFilterType;
                    if (stockFilter[filterKey]) {
                        requestStock = stockFilter[filterKey](requestStock, filter);
                    }
                });
            }

            const { data: stocks, error: errorStocks, count } = await requestStock.order('id_modele', { ascending: sort === 'asc' });
            if (errorStocks) {
                throw new NotFoundError(errorStocks.message);
            }

            let modelAdminRequest = this.supabase.from('modeles_admin')
                .select('id_modele, code_barre')
                .in('id_modele', modelIds);

            const { data: modelAdmins, error: errorModelAdmins, count: countModelAdmins } = await modelAdminRequest.order('id_modele', { ascending: sort === 'asc' });
            if (errorModelAdmins) {
                throw new NotFoundError(errorModelAdmins.message);
            }

            const stocksWithModel = await this.commonScriptForStocks(models_, stocks, modelAdmins);
            return {
                items: stocksWithModel,
                total: count ?? stocksWithModel.length, 
                count: stocksWithModel.length
            };
        }   else {
            let queryStocks = this.supabase
                .from('stocks')
                .select('*', { count: 'exact' });

            if (filters) {      
                filters.forEach(filter => {
                    const filterKey = filter.key as StockFilterType;
                    if (stockFilter[filterKey]) {
                        queryStocks = stockFilter[filterKey](queryStocks, filter);
                    }
                });
            }

            queryStocks = queryStocks.range(startOffset, endOffset);

            const { data: stocks, error: errorStocks, count } = await queryStocks.order('id_modele', { ascending: sort === 'asc' });
            if (errorStocks) {
                throw new NotFoundError(errorStocks.message);
            }

            if (stocks.length === 0) {
                return {
                    items: [],
                    total: count ?? 0,
                    count: 0
                };
            }

            // Récupérer tous les IDs des modèles
            const modelIds = stocks.map(stock => stock.id_modele);

            // Requêtes parallèles pour récupérer tous les modèles, codes-barres et images
            let requestModel = this.supabase.from('modeles')
                .select('*, produits(id, prix_vente_ht, tva, produit_descriptions(titre, lang)), modele_attribut_valeurs(id_attribut_valeur,attribut_valeurs(nom))')
                .in('id', modelIds);

            
            if (filterPublished && Array.isArray(filterPublished.values)) {
                if ((filterPublished.values as string[]).includes('PUBLIE')) {
                    requestModel = requestModel.eq('publier', true);
                } 
                if ((filterPublished.values as string[]).includes('NON_PUBLIE')) {
                    requestModel = requestModel.eq('publier', false);
                }
            }

            let modelAdminRequest = this.supabase.from('modeles_admin')
                .select('id_modele, code_barre')
                .in('id_modele', modelIds);

            // Exécuter les requêtes en parallèle
            const [modelsResult, modelAdminResult] = await Promise.all([
                requestModel,
                modelAdminRequest
            ]);

            if (modelsResult.error) {
                throw new InternalServerError(modelsResult.error.message);
            }
            if (modelAdminResult.error) {
                throw new InternalServerError(modelAdminResult.error.message);
            }

            let models = modelsResult.data || [];
            const modelAdmins = modelAdminResult.data || [];

            const produitIds = models.map(model => model.id_produit);

            const produit_descriptionsRequest = this.supabase.from('produit_descriptions')
                .select('id_produit, titre, lang')
                .eq('lang', 'fr')
                .in('id_produit', produitIds);
                

            const { data: produit_descriptions, error: errorProduitDescriptions, count: countProduitDescriptions } = await produit_descriptionsRequest.order('id_produit', { ascending: sort === 'asc' });
            if (errorProduitDescriptions) {
                throw new NotFoundError(errorProduitDescriptions.message);
            }

            const produit_descriptions_map = new Map(produit_descriptions.map((prod_desc: any) => [prod_desc.id_produit, prod_desc]));
            if(produit_descriptions_map.size === 0) {
                return {
                    items: [],
                    total: countProduitDescriptions ?? 0,
                    count: 0
                };
            }

            models = models.map((model: any) => {
                const produit_description = produit_descriptions_map.get(model.id_produit);
                if(produit_description) {
                    model.produits.produit_descriptions = [produit_description];
                }
                return model;
            });

            const stocksWithModel = await this.commonScriptForStocks(models, stocks, modelAdmins);
            
            return {
                items: stocksWithModel,
                total: count ?? stocksWithModel.length, 
                count: stocksWithModel.length
            };
        }
    }

    async readStockByIds(ids: number[]): Promise<ReturnAll<Stock>> {                

        if(ids.length === 0) {
            throw new BadRequestError("Ids is empty");
        }

        let request = this.supabase
            .from('stocks')
            .select('*', { count: 'exact' })
            .in('id_modele', ids);
        
        const { data, error, count } = await request;
        if (error) {
            throw new NotFoundError(error.message);
        }

        return {
            items: data.map((item) => mapToType<Stock>(item, StockKeyMap)),
            total: count ?? data.length, 
            count: data.length
        };
    }

    async updateStock(stocks: StockInput[]): Promise<void> {
        const { error } = await this.supabase
            .from('stocks')
            .upsert(
                stocks.map((stock) => mapFromType(stock, StockKeyMap))
            );

        if (error) {
            throw new InternalServerError(error.message);
        }
    }
}
