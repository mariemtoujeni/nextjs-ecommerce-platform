import { Product, ProductAttribute, ProductAttributeValues, ProductDescription, ProductFilter
    , ProductFilterTypeAdmin, ProductImage, ProductState, ProductStatus, ProductWithAdmin, Customization, ModelWithAttributs, 
    ProductUpdate,
    ProductDescriptionUpdate,
    OnlineShop,
    ProductAdd,
    ModelInfo,
    InfoProductByOrder,
    ProductPack} from "../../models/Product";
import { Brand, Category, Store, SubCategory } from "../../models/Category";
import { ModelAdmin, ModelAttributValue, ModelWithProduct } from "../../models/Model";
import { Supplier } from "../../models/Supplier";
import { Collection } from "../../models/Collection";
import { IProductRepository } from "../../repositories/IProductRepository";
import { ActiveFilter, ReturnAll } from "../../types/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { BadRequestError, InternalServerError, NotFoundError } from "../../types/error";
import { KeyMap, mapToType } from "./MapToType";
import { storeKeyMap } from "./StoreRepository";
import { supplierKeyMap } from "./SupplierRepository";
import { AttributValue, FilterAttributeInput } from "../../models/Attributes";
import { attributValueKeyMap } from "./AttributRepository";
import { categoryKeyMap } from "./CategoryRepository";
import { subCategoryKeyMap } from "./SubCategoryRepository";

const modelKeyMap: KeyMap<ModelAdmin> = {
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

const modelAttributValueKeyMap: KeyMap<ModelAttributValue> = {
    idModel: 'id_modele',
    idAttributValue: 'id_attribut_valeur',
    attributValue: {
        key: 'attribut_valeurs',
        transform: (value) => mapToType<AttributValue>(value, attributValueKeyMap)
    }
}

const modelWithProductKeyMap: KeyMap<ModelWithProduct> = {
    ...modelKeyMap,
    product: {
        key: 'produits',
        transform: (value) => mapToType<Product>(value, productKeyMap)
    },
    attributValues: {
        key: 'modele_attribut_valeurs',
        transform: (value) => Array.isArray(value)
            ? value.map(attribute => mapToType<ModelAttributValue>(attribute, modelAttributValueKeyMap))
            : []
    }
}

const collectionKeyMap: KeyMap<Collection> = {
    id: 'id',
    name: 'nom',
    active: 'actif',
}

export const brandKeyMap: KeyMap<Brand> = Object.assign({}, categoryKeyMap);

export const productModelKeyMap: KeyMap<ModelWithAttributs> = {
  id: 'id',
  price: 'prix_vente_ttc',
  stock: {
    key: 'stocks',
    transform: (stocks) => {
       return stocks && typeof stocks === 'object' && 'disponible' in stocks
        ? stocks.disponible
        : 0;
    },
  },

  attributeValues: {
    key: 'modele_attribut_valeurs',
    transform: (values) =>
      Array.isArray(values)
        ? values.map((v) =>
            mapToType<ProductAttributeValues>(v.attribut_valeurs, productAttributeValuesKeyMap)
          )
        : [],
  },
};



const productDescriptionKeyMap: KeyMap<ProductDescription> = {
    title: 'titre',
    lang: 'lang',
    description: 'description',
}

export const productImageKeyMap: KeyMap<ProductImage> = {
    productId: 'id_produit',
    url: {
        key: 'url',
        transform: (value) => `/api/assets/${value}`
    },
    attributeValueId: 'id_attribut_valeur',
    attribute: {
        key: 'attribut_valeurs',
        transform: (value) => mapToType<ProductAttributeValues>(value, productAttributeValuesKeyMap)
    }
}

export const productAttributeValuesKeyMap: KeyMap<ProductAttributeValues> = {
    id: 'id',
    name: 'nom',
    attribute: {
        key: 'attributs',
        transform: (value) => ({
            name: value?.nom
        })
    }
}

export const productAttributeKeyMap: KeyMap<ProductAttribute> = {
    id: 'id_attribut',
    name: 'attributs.nom',
    values: {
        key: 'produit_modele_attribut_valeurs',
        transform: (value) => Array.isArray(value)
            ? value.map(attribute => mapToType<ProductAttributeValues>(attribute.attribut_valeurs, productAttributeValuesKeyMap))
            : []
    }
}
export const customizationsKeyMap: KeyMap<Customization> = {
    id: 'id',
    description: 'description',
    price: 'prix',
}

export const productKeyMap: KeyMap<Product> = {
    id: 'id',
    categoryId: 'id_categorie',
    category: {
        key: 'categories',
        transform: (value) => mapToType<Category>(value, categoryKeyMap)
    },
    subCategoryId: 'id_sous_categories',
    subCategory: {
        key: 'sous_categories',
        transform: (value) => mapToType<SubCategory>(value, subCategoryKeyMap)
    },
    brandId: 'id_marque',
    brand: {
        key: 'marques',
        transform: (value) => mapToType<Brand>(value, brandKeyMap)
    },
    isPackage: 'is_pack',
    price: 'prix_vente_ht',
    vatRate: 'tva',
    isGiftCard: 'cheque_cadeau',
    giftCardDuration: 'cheque_duree',
    status: {
        key: 'etat_publication',
        transform: (value) => value as ProductStatus
    },
    customization: 'personnalisation',
    customizations: {
        key: 'produit_personnalisations',
        transform: (value) => Array.isArray(value)
            ? value.map(customization => mapToType<Customization>(customization, customizationsKeyMap))
            : []
    },
    minStock: 'stock_min',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    descriptions: {
        key: 'produit_descriptions',
        transform: (value) => Array.isArray(value)
            ? value.map(desc => mapToType<ProductDescription>(desc, productDescriptionKeyMap))
            : []
    },
    images: {
        key: 'produit_images',
        transform: (value) => Array.isArray(value)
            ? value.map(img => mapToType<ProductImage>(img, productImageKeyMap))
            : []
    },
    modelAttributs: {
        key: 'modeles',
        transform: (value) =>
            Array.isArray(value)
                ? value.map(model => mapToType<ModelWithAttributs>(model, productModelKeyMap))
                : []
    },
    modeles: {
        key: 'modeles',
        transform: (value) => Array.isArray(value)
            ? value.map(model => mapToType<ModelWithProduct>(model, modelWithProductKeyMap))
            : []
    },
    stores: {
        key: 'magasins',
        transform: (value) => Array.isArray(value)
            ? value.map(store => mapToType<Store>(store, storeKeyMap))
            : []
    },
    productAttributes: {
        key: 'produit_modele_attributs',
        transform: (value) => Array.isArray(value)
            ? value.map(attribute => mapToType<ProductAttribute>(attribute, productAttributeKeyMap))
            : []
    },
    weight: 'poids',
    onlineShops: {
        key: 'produit_boutiques',
        transform: (value) =>
        Array.isArray(value)
            ? value.map((shop: { boutique: OnlineShop }) => shop.boutique)
            : []
    }
};

export const productAdminKeyMap: KeyMap<ProductWithAdmin> = {
    ...productKeyMap,
    supplierId: {
        key: 'produits_admin',
        transform: (value) => value && value.fournisseurs ? value.fournisseurs.id : undefined
    },
    state: {
        key: 'produits_admin.etat_info',
        transform: (value) => {
            return  value as ProductState
        }
    },
    supplier: {
        key: 'fournisseurs',
        transform: (value) => mapToType<Supplier>(value, supplierKeyMap)
    },
    manufacturerReference: 'produits_admin.reference_fabricant',
    comment: 'produits_admin.commentaire',
    buyPriceWithoutVat: 'produits_admin.prix_achat_ht',
    collections: {
        key: 'collections',
        transform: (value) => Array.isArray(value)
            ? value.map(collection => mapToType<Collection>(collection, collectionKeyMap))
            : []
    },
    barCode: 'produits_admin.code_barre',
    supplierReference: 'produits_admin.reference_fournisseur'
};

const ModelInfoKeyMap: KeyMap<ModelInfo> = {  
  productId: "id_produit"
}
export const InfoProductByOrderKeyMap: KeyMap<InfoProductByOrder> = {
    orderLineId: "id",
    barCode: "code_barre",
    productId: {
        key: 'modeles',
        transform: (value) => {
            const model = value ? mapToType<ModelInfo>(value, ModelInfoKeyMap) : null;
            return model ? model.productId : null;
        }
    },
    modelId: "id_modele",
    descriptions: {
        key: 'modeles.produits.produit_descriptions',
        transform: (value) => Array.isArray(value) ?
            value.map((v) => mapToType<ProductDescription>(v, productDescriptionKeyMap)) : []
    },
    titled: "intitule",
    commandId: "id_commande"
};

export const productPackKeyMap: KeyMap<ProductPack> = {
    id: "id",
    productId: "id_produit",
    modelId: "id_modele",
    modelAttributs: {
        key: 'modeles',
        transform: (value) => value ? mapToType<ModelWithAttributs>(value[0], productModelKeyMap) : null
    },
    modelProduct: {
        key: 'modeles',
        transform: (value) => value ? mapToType<ModelWithProduct>(value[0], modelWithProductKeyMap) : null
    },
    product: {
        key: 'produits',
        transform: (value) => mapToType<Product>(value, productKeyMap)
    }
};


type FilterMappingReturn = {
    column: string;
    query: string;
    filterValues: string[];
}
type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => FilterMappingReturn;
export const producFilter: Record<ProductFilterTypeAdmin, FilterMappginFunction> = {
    [ProductFilterTypeAdmin.STORE]: (baseQuery, filter) => ({
        column: "magasins.id",
        query: baseQuery.replace("magasins(", "magasins!inner("),
        filterValues: filter.values as string[]
    }),
    [ProductFilterTypeAdmin.CATEGORY]: (baseQuery, filter) => ({
        column: "id_categorie",
        query: baseQuery,
        filterValues: filter.values as string[]
    }),
    [ProductFilterTypeAdmin.SUBCATEGORY]: (baseQuery, filter) => ({
        column: "id_sous_categories",
        query: baseQuery,
        filterValues: filter.values as string[]
    }),
    [ProductFilterTypeAdmin.BRAND]: (baseQuery, filter) => ({
        column: "id_marque",
        query: baseQuery,
        filterValues: filter.values as string[]
    }),
    [ProductFilterTypeAdmin.ATTRIBUTE]: (baseQuery, filter) => {

        let values: string[] = [];

        if (typeof filter.values[0] === 'string') {
            values = (filter.values as string[]);
        } else {
            const attributes = filter.values as ActiveFilter[];
            values = attributes.map(attribute => (attribute.values as string[])).flat();
        }

        return {
            column: "produit_modele_attributs.produit_modele_attribut_valeurs.id_attribut_valeur",
            query: baseQuery.replace('produit_modele_attributs(', "produit_modele_attributs!inner(")
                .replace('produit_modele_attribut_valeurs(', "produit_modele_attribut_valeurs!inner("),
            filterValues: values
        }
    },
    [ProductFilterTypeAdmin.SUPPLIER]: (baseQuery, filter) => ({
        column: 'produits_admin.id_fournisseur',
        query: baseQuery.replace('produits_admin(', "produits_admin!inner("),
        filterValues: filter.values as string[]
    }),
    [ProductFilterTypeAdmin.STATE]: (baseQuery, filter) => ({
        column: 'etat_publication',
        query: baseQuery,
        filterValues: filter.values as string[]
    }),
};


export class ProductRepository implements IProductRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }   
    
    async deleteProductFromPack(productId: number, associatedProductId: number): Promise<void> {
        const { data: models, error: modelError } = await this.supabase
            .from('modeles')
            .select('id')
            .eq('id_produit', associatedProductId);

        if (modelError) {
            throw new InternalServerError(modelError.message);
        }

        if (!models || models.length === 0) {
            return;
        }

        const modelIds = models.map(model => model.id);

        const { error: deleteError } = await this.supabase
            .from('produit_pack')
            .delete()
            .eq('id_produit', productId)
            .in('id_modele', modelIds);

        if (deleteError) {
            throw new InternalServerError(deleteError.message);
        }
    }

    async updatePricesWithVAT(productId: number, vatRate: number): Promise<void> {
        const { data: product, error } = await this.supabase
            .from("produits")
            .select("id, prix_vente_ht, prix_vente_ttc, tva, modeles(id, prix_vente_ht, prix_vente_ttc)")
            .eq("id", productId)
            .single();

        if (error) {
            throw new NotFoundError(`Product with id ${productId} not found: ${error.message}`);
        }

        if (!product) {
            return;
        }

        if (product.tva !== vatRate) {
            const newTTC = product.prix_vente_ht * (1 + vatRate / 100);
            const { error: updateProductError } = await this.supabase
            .from("produits")
            .update({ prix_vente_ttc: newTTC, tva: vatRate })
            .eq("id", productId);

            if (updateProductError) {
            throw new InternalServerError(`Failed to update product ${productId}: ${updateProductError.message}`);
            }

            if (product.modeles && Array.isArray(product.modeles) && product.modeles.length > 0) {
            const updates = product.modeles.map((model) => ({
                id: model.id,
                prix_vente_ttc: model.prix_vente_ht * (1 + vatRate / 100),
            }));

            const { error: updateModelsError } = await this.supabase
                .from("modeles")
                .upsert(updates, { onConflict: "id" }); 

            if (updateModelsError) {
                throw new InternalServerError( `Failed to bulk update models for product ${productId}: ${updateModelsError.message}` );
            }
            }
        }
    }



    async addProductPack(productId: number, associatedProductIds: number[]): Promise<number[]> {
        if (!associatedProductIds || associatedProductIds.length === 0) return [];
        const { data: models, error: modelError } = await this.supabase
            .from('modeles')
            .select('id')
            .in('id_produit', associatedProductIds);

        if (modelError) throw new InternalServerError(modelError.message);
        if (!models || models.length === 0) return [];

        const inserts = models.map(model => ({
            id_produit: productId,   
            id_modele: model.id    
        }));
        //batch insert
        const { data: insertedData, error: insertError } = await this.supabase
            .from('produit_pack')
            .insert(inserts)
            .select('*');  

        if (insertError) throw new InternalServerError(insertError.message);

        return insertedData.map(d => d.id);
    }

    
    async addProductImage(img: ProductImage): Promise<ProductImage> {
        const { data, error } = await this.supabase.from('produit_images').insert({
            id_produit: img.productId,
            url: img.url,
            id_attribut_valeur: img.attributeValueId
        }).select("*").single();
        if (error) throw new InternalServerError(error.message);
        return mapToType<ProductImage>(data, productImageKeyMap);
    }

    async getPack(id: number): Promise<ProductPack[]> {
        //fetch pack items
        const { data: packItems, error: packError } = await this.supabase
            .from('produit_pack')
            .select('id, id_produit, id_modele')
            .eq('id_produit', id);

        if (packError) throw new NotFoundError(packError.message);
        if (!packItems || packItems.length === 0) return [];

        const modelIds = packItems.map(p => p.id_modele);

        //fetch models with attributes
        const { data: modelsData, error: modelError } = await this.supabase
            .from('modeles')
            .select(`*, modele_attribut_valeurs(attribut_valeurs(*, attributs(*)))`)
            .in('id', modelIds);

        if (modelError) throw new NotFoundError(modelError.message);

        const productIds = modelsData.map(m => m.id_produit);

        //fetch products
        const { data: productsData, error: productsError } = await this.supabase
            .from('produits')
            .select('*, produit_descriptions!inner(*), produit_images!inner(*)')
            .in('id', productIds);

        if (productsError) throw new NotFoundError(productsError.message);

        //construct object to return 
        const packWithProducts: ProductPack[] = packItems.map(packItem => {
            const model = modelsData.find(m => m.id === packItem.id_modele);
            const modelProduct = productsData.find(p => p.id === model?.id_produit);

            return {
                id: packItem.id,
                productId: packItem.id_produit,
                modelId: packItem.id_modele,
                modelAttributs: model ? mapToType<ModelWithAttributs>(model, productModelKeyMap) : undefined,
                modelProduct: modelProduct ? mapToType<ModelWithProduct>(modelProduct, modelWithProductKeyMap) : undefined,
                product: modelProduct ? mapToType<Product>(modelProduct, productKeyMap) : undefined
            };
        });

        return packWithProducts;
    }

    async readAll(): Promise<Product[]> {

        let querySelect = '*, magasins(*), categories(*), sous_categories(*), marques(*), produit_descriptions!inner(*)\
          , produit_images(*), produits_admin(*, fournisseurs(*)), \
          produit_modele_attributs(*, attributs(*), produit_modele_attribut_valeurs(*, attribut_valeurs(*, attributs(*))))';

        const { data, error } = await this.supabase
            .from('produits')
            .select(querySelect)
            .limit(1000);

        if (error) {
            throw new NotFoundError(error.message);
        }

        const products = data ? data.map(product => mapToType<Product>(product, productKeyMap)) : [];
        
        return products;
    }
    
    async read(options: ProductFilter, filterFrontend?: FilterAttributeInput[]): Promise<ReturnAll<ProductWithAdmin>> {
        //console.log(" ************************** read ************************** ");
        const startOffset = options.offset * options.limit;
        const endOffset = startOffset + options.limit - 1;

        let querySelect = '*, magasins(*), categories(*), sous_categories(*), marques(*), produit_descriptions!inner(*)\
          , produit_images(*), produits_admin(*, fournisseurs(*)), \
          produit_modele_attributs(*, attributs(*), produit_modele_attribut_valeurs(*, attribut_valeurs(*, attributs(*))))';


        const filterToApply: FilterMappingReturn[] = [];
        if (options.filters) {
            options.filters.forEach(filter => {
                const newFilter = producFilter[filter.key as ProductFilterTypeAdmin](querySelect, filter);
                filterToApply.push(newFilter);
                querySelect = newFilter.query;
            });
        }

        const baseQuery = this.supabase.from('produits')
            .select(querySelect, { count: 'exact' })
            .range(startOffset, endOffset)
            .order('id', { ascending: options.sort === 'asc' })

        if (options.search) {
            const searchAsNumber = parseInt(options.search);

            if (!isNaN(searchAsNumber)) {
                baseQuery.eq('id', searchAsNumber);
            } else {
                baseQuery.ilike('produit_descriptions.titre', `%${options.search}%`);
            }
        }

        filterToApply.forEach(filter => {
            baseQuery.in(filter.column, filter.filterValues);
        });

        if (filterFrontend && filterFrontend.length > 0) {            
            // filtrer par marque
            const brandFilterAttribut = filterFrontend.find(filter => filter.type === 'brand');            
            if(brandFilterAttribut) {
                baseQuery.in('id_marque', brandFilterAttribut.attribute_value_ids);
            }

            // filtrer par couleur, taille ou dynamique
            const dynamicFilterAttributs = filterFrontend.filter(filter => filter.type === 'color' || filter.type === 'size' || filter.type === 'dynamic');
            if(dynamicFilterAttributs.length > 0) {
                let subSelectProductsQuery = this.supabase.from('produits')
                    .select('*, magasins(*), categories(*), sous_categories(*)');
                filterToApply.forEach(filter => {
                    subSelectProductsQuery.in(filter.column, filter.filterValues);
                });
                const allProducts = await subSelectProductsQuery;
                
                let productIds: number[] = [];
                
                // Traiter chaque filtre dynamique
                for (const dynamicFilterAttribut of dynamicFilterAttributs) {
                    if (dynamicFilterAttribut.id_attribute >= 0 && dynamicFilterAttribut.attribute_value_ids.length > 0) {
                        const produitModeleAttributValeursQuery = this.supabase.from('produit_modele_attribut_valeurs')
                            .select('*')
                            .eq('id_attribut', dynamicFilterAttribut.id_attribute)
                            .in('id_attribut_valeur', dynamicFilterAttribut.attribute_value_ids);
                        
                        if(allProducts.data && allProducts.data.length > 0) {
                            produitModeleAttributValeursQuery.in('id_produit', allProducts.data.map(product => product.id));
                        }

                        const produitModeleAttributValeurs = await produitModeleAttributValeursQuery;
                        if(produitModeleAttributValeurs.data && produitModeleAttributValeurs.data.length > 0) {
                            const currentProductIds = produitModeleAttributValeurs.data.map(produitModeleAttributValeur => produitModeleAttributValeur.id_produit);
                            
                            if (productIds.length === 0) {
                                productIds = currentProductIds;
                            } else {
                                // Intersection des IDs pour les filtres multiples
                                productIds = productIds.filter(id => currentProductIds.includes(id));
                            }
                        }
                    }
                }
                
                if(productIds.length > 0) {
                    // enlever les doublons
                    const uniqueProductIds = [...new Set(productIds)];
                    // reduire la taille de la liste à 1000
                    baseQuery.in('id', uniqueProductIds.slice(0, 1000));                    
                }
            }

            // filtrer par prix
            const priceFilterAttribut = filterFrontend.find(filter => filter.type === 'price');
            if(priceFilterAttribut && priceFilterAttribut.attribute_value.length === 2) {
                baseQuery.gte('prix_vente_ttc', priceFilterAttribut.attribute_value[0])
                    .lte('prix_vente_ttc', priceFilterAttribut.attribute_value[1]);
            }
        }

        const products = await baseQuery;

        if (products.error) {
            throw new NotFoundError(products.error.message);
        }

        return {
            items: products?.data ? products.data.map(product => mapToType<ProductWithAdmin>(product, productAdminKeyMap)) : [],
            total: products?.count ?? 0,
            count: products?.data ? products.data.length : 0,
        };
    }
    // Get all products
    
    
    // Get the product by id
    async readById(id: number): Promise<Product> {
        const { data, error } = await this.supabase
            .from('produits')
            .select('*, produit_personnalisations(*),produit_descriptions(*), produit_images(*), modeles(id, prix_vente_ttc,stocks(*), modele_attribut_valeurs(attribut_valeurs(*, attributs(*)))), categories(*), sous_categories(*), marques(*),produit_modele_attributs(id_attribut, attributs(nom), produit_modele_attribut_valeurs(id_attribut_valeur, attribut_valeurs(*)) )')
            .eq('id', id)
            .single();
        
        if (!data) {
            throw new NotFoundError(`Product with id ${id} not found`);
        }

        if (error) {
            throw new NotFoundError(error.message); }
        
        return mapToType<Product>(data, productKeyMap);         
        

    }
    async findBySubCategoryId(subCategoryId: number, productId: number): Promise<Product[]> {
        const { data, error } = await this.supabase
            .from('produits')
            .select('*, categories(*), sous_categories(*), marques(*), produit_descriptions(*), produit_images(*), modeles(id, prix_vente_ttc,stocks(disponible), modele_attribut_valeurs(attribut_valeurs(*, attributs(*))))')
            .eq('id_sous_categories', subCategoryId)
            .eq('etat_publication', 'PUBLIE')
            .neq('id', productId);

        if (error) {
            throw new NotFoundError(error.message);
        }

        return data ? data.map(product => mapToType<Product>(product, productKeyMap)) : [];
    }
    
    async readAdmin(id: number): Promise<ProductWithAdmin> {
        const { data, error } = await this.supabase
            .from('produits')
            .select('*, produit_descriptions(*), produit_images(*, attribut_valeurs(*)), produit_modele_attributs(*, attributs(*), produit_modele_attribut_valeurs(*, attribut_valeurs(*, attributs(*))))\
                , modeles(*, modele_attribut_valeurs(*, attribut_valeurs(*, attributs(*))), modeles_admin(*)), categories(*), sous_categories(*), marques(*), produits_admin!inner(*,fournisseurs!inner(*))\
                , magasins(*), collections(*), produit_personnalisations(*), produit_boutiques(boutique)')
            .eq('id', id)
            .maybeSingle();

        const product = mapToType<ProductWithAdmin>(data, productAdminKeyMap);
        return product;
    }

    async readAdminByModelId(modelId: number): Promise<ProductWithAdmin> {
        const { data, error } = await this.supabase
            .from('modeles')
            .select('*, produits(*, produit_descriptions(*), produits_admin!inner(*,fournisseurs!inner(*)))')
            .eq('id', modelId)
            .eq('produits.produit_descriptions.lang', 'fr')
            .limit(1);

        if (!data || data.length === 0) {
            throw new NotFoundError(`Model with id ${modelId} not found`);
        }        

        const productObject = {
            ...data[0].produits
        };

        const product = mapToType<ProductWithAdmin>(productObject, productAdminKeyMap);
        return product;
    }

    async update(id: number, data: ProductUpdate): Promise<void> {

        const { error } = await this.supabase
            .from('produits')
            .update({
                id_categorie: data.categoryId,
                id_sous_categories: data.subCategoryId,
                id_marque: data.brandId,
                is_pack: data.isPackage,
                prix_vente_ht: data.price,
                tva: data.vatRate,
                cheque_cadeau: data.isGiftCard,
                cheque_duree: data.giftCardDuration,
                etat_publication: data.status,
                personnalisation: data.customization,
                stock_min: data.minStock,
                poids: data.weight
            })
                    .eq('id', id);
        if (error) {
            throw new NotFoundError(error.message);
        }
        

        const updateAdmin = await this.supabase
            .from('produits_admin')
            .update({
                prix_achat_ht: data.buyPriceWithoutVat,
                id_fournisseur: data.supplierId,
                reference_fabricant: data.manufacturerReference,
                commentaire: data.comment,
                etat_info: data.state
            })
            .eq('id_produit', id);

        if (updateAdmin.error) {
            throw new BadRequestError(updateAdmin.error.message);
        }

    }

    async updateDescription(id: number, data: ProductDescriptionUpdate): Promise<void> {
        const { error } = await this.supabase
            .from('produit_descriptions')
            .update({
                titre: data.title,
                description: data.description
            })
            .eq('id_produit', id)
            .eq('lang', data.lang);

        if (error) {
            throw new BadRequestError(error.message);
        }
    }

    async readOnlineShopsByProductId(id: number): Promise<OnlineShop[]> {
        const { data, error } = await this.supabase
            .from('produit_boutiques')
            .select('*')
            .eq('id_produit', id);

        if (error) {
            throw new NotFoundError(error.message);
        }
        return data ? data.map(shop => shop.boutique) : [];
    }

    async addOnlineShops(id: number, shops: OnlineShop[]): Promise<void> {
        const { error } = await this.supabase
            .from('produit_boutiques')
            .upsert(shops.map(shop => ({ id_produit: id, boutique: shop })));

        if (error) {
            throw new BadRequestError(error.message);
        }
    }

    async removeOnlineShops(id: number, shops: OnlineShop[]): Promise<void> {
        const { error } = await this.supabase
            .from('produit_boutiques')
            .delete()
            .eq('id_produit', id)
            .in('boutique', shops);

        if (error) {
            throw new BadRequestError(error.message);
        }
    }

    async create(product: Omit<ProductAdd, "productAttributes" | "modeles" | "modelAttributs" | "productCustomizations">): Promise<Product> {
        const { data, error } = await this.supabase
            .from('produits')
            .insert({
                personnalisation: product.customizable,
                is_pack: product.isPackage,
                id_categorie: product.categoryId,
                id_sous_categories: product.subCategoryId,
                id_marque: product.brandId,
                prix_vente_ht: product.price,
                tva: product.vatRate,
                prix_vente_ttc: product.price * (1 + product.vatRate / 100),
                poids: product.weight,
                cheque_cadeau: product.isGiftCard,
                cheque_duree: product.giftCardDuration,
                etat_publication: ProductStatus.DRAFT,
                stock_min: product.minStock,
            })
            .select("*")
            .single();

        if (error) {
            throw new BadRequestError(error.message);
        }

        const productAdmin = await this.supabase.from('produits_admin')
            .insert({
                id_produit: data.id,
                prix_achat_ht: product.price,
                id_fournisseur: product.supplierId,
                reference_fabricant: product.manufacturerReference,
                commentaire: "",
                etat_info: ProductState.NORMAL
            })
            .select("*")
            .single();

        if (productAdmin.error) {
            throw new BadRequestError(productAdmin.error.message);
        }

        const productDescriptions = await this.supabase.from('produit_descriptions')
            .insert(product.descriptions.map(description => ({
                id_produit: data.id,
                titre: description.title,
                description: description.description,
                lang: description.lang
            })));

        if (productDescriptions.error) {
            throw new BadRequestError(productDescriptions.error.message);
        }

        return mapToType<Product>({...data, productAdmin, productDescriptions}, productKeyMap);
    }

    async createAttribute(productId: number, attribute: ProductAttribute): Promise<void> {
        const { error } = await this.supabase
            .from('produit_modele_attributs')
            .insert({
                id_produit: productId,
                id_attribut: attribute.id
            });

        if (error) {
            throw new BadRequestError(error.message);
        }

        const attributValues = attribute.values.map(value => ({
            id_produit: productId,
            id_attribut: attribute.id,
            id_attribut_valeur: value.id
        }));

        const { error: errorAttributValues } = await this.supabase
            .from('produit_modele_attribut_valeurs')
            .insert(attributValues);
    }
    
    async getTitleProductByOrder(commandId: number): Promise<InfoProductByOrder[]> {
      const { data, error } = await this.supabase
        .from("commande_lignes")
        .select(`
          id,
          code_barre,
          id_modele,
          intitule,
          id_commande,
          modeles!inner (id,id_produit, produits!inner (produit_descriptions(*)) )`)
        .eq("id_commande", commandId);       
      
    
      if (error) throw new NotFoundError(error.message);

      return data ? data.map((item) => mapToType<InfoProductByOrder>(item, InfoProductByOrderKeyMap)) : [];
    }
}