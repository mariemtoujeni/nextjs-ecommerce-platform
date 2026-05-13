import { FilterAttribute, CreateAttributeRequest, AttributWithValues, Attribut, AttributFilter, AttributValue, FilterAttributePresenter } from '../../models/Attributes';
import { IAttributRepository, listFilterAttributesProps } from '../../repositories/IAttributRepository';
import { InternalServerError } from '../../types/error';
import { SupabaseClient } from '@supabase/supabase-js';
import { KeyMap } from './MapToType';

export const attributValueKeyMap: KeyMap<AttributValue> = {
    id: 'id',
    id_attribut: 'id_attribut',
    nom: 'nom'
}

export class AttributRepository implements IAttributRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
    async readAllAttributesWithValues(): Promise<AttributWithValues[]> {
        const { data, error } = await this.supabase.from('attributs').select('*, attribut_valeurs(*)');
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async readAllAttributes(): Promise<Attribut[]> {
        const { data, error } = await this.supabase.from('attributs').select('*');
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async readAllFilters(): Promise<AttributFilter[]> {
        const { data, error } = await this.supabase.from('filtres').select('*');
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async readAllAttributeValues(): Promise<AttributValue[]> {
        const { data, error } = await this.supabase.from('attribut_valeurs').select('*');
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async readFilterByNameAndAttributeId(name: string, id_attribut: number): Promise<AttributFilter> {
        const { data, error } = await this.supabase.from('filtres').select('*').eq('nom', name).eq('id_attribut', id_attribut);
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data[0];
    }

    async readAttribute(id: number): Promise<Attribut> {
        const { data, error } = await this.supabase.from('attributs').select('*').eq('id', id);
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data[0];
    }

    async readFiltersByAttributeId(id: number): Promise<AttributFilter[]> {
        const { data, error } = await this.supabase.from('filtres').select('*').eq('id_attribut', id);
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async readValuesByAttributeId(id: number): Promise<AttributValue[]> {
        // First get all attribute values
        const { data: attributeValues, error: valuesError } = await this.supabase
            .from('attribut_valeurs')
            .select('*')
            .eq('id_attribut', id);

        if (valuesError) {
            throw new InternalServerError(valuesError.message);
        }
        
        return attributeValues;
    }

    async createAttribute(attribute: CreateAttributeRequest): Promise<Attribut> {
        const { data, error } = await this.supabase.from('attributs').insert(attribute).select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data[0];
    }

    async updateAttribute(attribute: Attribut): Promise<Attribut> {
        const { data, error } = await this.supabase.from('attributs').update(attribute).eq('id', attribute.id).select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data[0];
    }   

    async deleteAttribute(id: number): Promise<void> {
        const { error } = await this.supabase.from('attributs').delete().eq('id', id);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async createAttributeValue(attributeValue: Omit<AttributValue, 'id'>): Promise<AttributValue> {
        const { data, error } = await this.supabase.from('attribut_valeurs').insert(attributeValue).select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data[0];
    }

    async updateAttributeValue(attributeValue: AttributValue): Promise<AttributValue> {
        const { data, error } = await this.supabase.from('attribut_valeurs').update(attributeValue).eq('id', attributeValue.id).select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data[0];
    }

    async deleteAttributeValue(id: number): Promise<void> {
        const { error } = await this.supabase.from('attribut_valeurs').delete().eq('id', id);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async deleteAllAttributeValuesByFilterId(id_filtre: number): Promise<void> {
        const { error } = await this.supabase.from('attribut_valeurs').delete().eq('id_filtre', id_filtre);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async createFilter(filter: Omit<AttributFilter, 'id'>): Promise<AttributFilter> {
        const { data, error } = await this.supabase.from('filtres').insert(filter).select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data[0];
    }

    async updateFilter(filter: AttributFilter): Promise<AttributFilter> {
        const { data, error } = await this.supabase.from('filtres').update(filter).eq('id', filter.id).select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data[0];
    }

    async deleteFilter(id: number): Promise<void> {
        const { error } = await this.supabase.from('filtres').delete().eq('id', id);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async createFilterAttribute(filterAttribute: FilterAttribute): Promise<FilterAttribute> {
        const { data, error } = await this.supabase.from('filtres_attributs').insert(filterAttribute).select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data[0];
    }

    async deleteFilterAttribute(filterAttribute: FilterAttribute): Promise<void> {
        const { error } = await this.supabase.from('filtres_attributs').delete()
            .eq('id_attribut', filterAttribute.id_attribut)
            .eq('id_filtre', filterAttribute.id_filtre);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async deleteAllFilterAttributesByAttributeValueId(id_attribut_value: number): Promise<void> {
        const { error } = await this.supabase.from('filtre_attributs').delete().eq('id_attribut', id_attribut_value);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async deleteAllFilterAttributesByAttributeValueIds(id_attribut_values: number[]): Promise<void> {
        const { error } = await this.supabase.from('filtre_attributs').delete().in('id_attribut', id_attribut_values);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async readAllFilterAttributesByAttributeValueId(id_attribut_value: number): Promise<FilterAttribute[]> {
        const { data, error } = await this.supabase.from('filtre_attributs').select('*').eq('id_attribut', id_attribut_value);
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async readFilterAttributesByAttributeValueId(id_attribut_values: number[]): Promise<FilterAttribute[]> {
        const { data, error } = await this.supabase.from('filtre_attributs').select('*').in('id_attribut', id_attribut_values);
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    // New batch operations
    async updateFilters(filters: AttributFilter[]): Promise<AttributFilter[]> {
        const { data, error } = await this.supabase
            .from('filtres')
            .upsert(filters)
            .select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async createFilters(filters: AttributFilter[]): Promise<AttributFilter[]> {
        const { data, error } = await this.supabase
            .from('filtres')
            .insert(filters)
            .select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async deleteFilters(ids: number[]): Promise<void> {
        const { error } = await this.supabase
            .from('filtres')
            .delete()
            .in('id', ids);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async updateAttributeValues(values: Omit<AttributValue, 'linkedFilters'>[]): Promise<AttributValue[]> {
        const { data, error } = await this.supabase
            .from('attribut_valeurs')
            .upsert(values)
            .select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async createAttributeValues(values: Omit<AttributValue, 'id' | 'linkedFilters'>[]): Promise<AttributValue[]> {
        const { data, error } = await this.supabase
            .from('attribut_valeurs')
            .insert(values)
            .select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async deleteAttributeValues(ids: number[]): Promise<void> {
        const { error } = await this.supabase
            .from('attribut_valeurs')
            .delete()
            .in('id', ids);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async deleteAllFilterAttributesByFilterIds(ids_filtre: number[]): Promise<void> {
        const { error } = await this.supabase
            .from('filtre_attributs')
            .delete()
            .in('id_filtre', ids_filtre);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    async createFilterAttributes(filterAttributes: FilterAttribute[]): Promise<FilterAttribute[]> {
        // Now create the filter attributes
        const { data, error } = await this.supabase
            .from('filtre_attributs')
            .insert(filterAttributes)
            .select();
        if (error) {
            throw new InternalServerError(error.message);
        }
        return data;
    }

    async deleteFilterAttributesByValueIds(valueIds: number[]): Promise<void> {
        const { error } = await this.supabase
            .from('filtre_attributs')
            .delete()
            .in('id_attribut', valueIds);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }

    // For frontend - Optimized version
    async readAllFilterAttributes(props?: listFilterAttributesProps): Promise<FilterAttributePresenter[]> {
        const { store, category, sousCategory, filterAttributeInput } = props || {};
        let categoryId = 0;
        let sousCategoryId = 0;
        let storeId = 0;

        let filterAttributes: FilterAttributePresenter[] = [];

        // Recupération des marques 
        const produitsReq = this.supabase.from('produits')
            .select('*, marques(*), produit_modele_attributs!id_produit(*, attributs(*)), produit_magasins!id_produit(*, magasins(*))')
            .eq('etat_publication', 'PUBLIE');

        if(store) {
            const { data: magasins, error: magasinsError } = await this.supabase
                .from('magasins')
                .select('*')
                .eq('nom', store)
                .single();
            if(magasinsError) {
                throw new InternalServerError(magasinsError.message);
            }
            storeId = magasins.id;
            produitsReq.eq('produit_magasins.id_magasin', storeId);
        }

        if(category) {
            const { data: categories, error: categoriesError } = await this.supabase
                .from('categories')
                .select('*')
                .eq('nom', category)
                .single();
            if(categoriesError) {
                throw new InternalServerError(categoriesError.message);
            }
            categoryId = categories.id;        
            produitsReq.eq('id_categorie', categoryId);
        }
        if(sousCategory) {
            const { data: sousCategories, error: sousCategoriesError } = await this.supabase
                .from('sous_categories')
                .select('*')
                .eq('nom', sousCategory)
                .single();
            if(sousCategoriesError) {
                throw new InternalServerError(sousCategoriesError.message);
            }
            sousCategoryId = sousCategories.id;
            produitsReq.eq('id_sous_categories', sousCategoryId);
        }

        let idProduits: number[] = [];
        if(filterAttributeInput && filterAttributeInput.length > 0) {
            const { data: produitModeleAttributValeurs, error: produitModeleAttributValeursError } = await this.supabase
                .from('produit_modele_attribut_valeurs')
                .select('*')
                .in('id_attribut', filterAttributeInput.filter(filter => filter.type !== 'brand' && filter.type !== 'price').map(filter => filter.id_attribute))
                .in('id_attribut_valeur', filterAttributeInput.filter(filter => filter.type !== 'brand' && filter.type !== 'price').flatMap(filter => filter.attribute_value_ids));
            if(produitModeleAttributValeursError) {
                throw new InternalServerError(produitModeleAttributValeursError.message);
            }
            // préparer une liste d'id_produit unique
            idProduits = [...new Set(produitModeleAttributValeurs.map(produitModeleAttributValeur => produitModeleAttributValeur.id_produit))];            
        }

        const allProduits = await produitsReq;
        if(allProduits.error) {
            throw new InternalServerError(allProduits.error.message);
        }
        let produits = allProduits.data ? idProduits.length > 0 ? allProduits.data?.filter(produit => idProduits.includes(produit.id)) : allProduits.data : [];
        // treat brand filter if exist
        if(filterAttributeInput && filterAttributeInput.some(filter => filter.type === 'brand')) {   
            const selectedBrands = filterAttributeInput.filter(filter => filter.type === 'brand').map(filter => filter.attribute_value).flat();
            produits = produits.filter(produit => {
                return selectedBrands.includes(produit.marques.nom);
            });
        }

        // treat price filter if exist
        if(filterAttributeInput && filterAttributeInput.find(filter => filter.type === 'price')) {
            const prices_range = filterAttributeInput.find(filter => filter.type === 'price')?.attribute_value;
            if(prices_range && prices_range.length === 2) {
                produits = produits.filter(produit => produit.prix_vente_ttc >= prices_range[0] && produit.prix_vente_ttc <= prices_range[1]);
            }
        }

        // Récupération de tous les IDs d'attributs et déduplication
        const allAttributsIds = produits.flatMap((produit: any) => 
            produit.produit_modele_attributs.map((attribut: any) => attribut.id_attribut)
        ) || [];
        
        // Déduplication des IDs d'attributs
        const attributsIds = [...new Set(allAttributsIds)];
        
        // Recupération des attributs
        const { data, error } = await this.supabase
            .from('attributs')
            .select(`
                id,
                nom,
                legende,
                attribut_valeurs!inner(
                    id,
                    nom,
                    id_attribut,
                    filtre_attributs!inner(
                        id_filtre,
                        filtres!inner(
                            id,
                            nom,
                            couleur
                        )
                    )
                )
            `)
            .in('id', attributsIds);

        if (error) {
            throw new InternalServerError(error.message);
        }

        // Transform the nested data structure
        let prov_filterAttributes = await Promise.all(data.map(async attribute => {
            // Group attribute values by filter
            const filterMap = new Map<number, {
                id: number;
                nom: string;
                couleur: string;
                attribut_values: Array<{id: number; nom: string; id_attribut: number}>;
                productCount: number;
            }>();

            // Process all attribute values
            let generalProductCount = 0;
            for (const attrValue of attribute.attribut_valeurs) {
                for (const pivot of attrValue.filtre_attributs) {
                    const filterId = pivot.id_filtre;
                    const filter = Array.isArray(pivot.filtres) ? pivot.filtres[0] : pivot.filtres;
                    
                    if (!filter) continue; // Skip if filter is undefined                                        
                    
                    let countProduct = 0;
                    if (!filterMap.has(filterId)) {                      
                        // Get product count for this filter
                        const { count } = await this.supabase
                            .from('produit_modele_attribut_valeurs')
                            .select('*', {count: 'exact'})
                            .eq('id_attribut_valeur', attrValue.id)
                            .eq('id_attribut', attribute.id)
                            .in('id_produit', produits.map((produit: any) => produit.id) || []);                          
                        generalProductCount += count || 0;
                        countProduct = count || 0;
                        if(count && count > 0) {
                            filterMap.set(filterId, {
                                id: filter.id,
                                nom: filter.nom,
                                couleur: filter.couleur,
                                attribut_values: [],
                                productCount: count || 0
                            });
                        }
                    }

                    // Add attribute value if not already present
                    const filterEntry = filterMap.get(filterId);
                    const existingValue = filterEntry?.attribut_values.find(v => v.id === attrValue.id);
                    if (filterEntry && !existingValue) {
                        filterEntry.attribut_values.push({
                            id: attrValue.id,
                            nom: attrValue.nom,
                            id_attribut: attrValue.id_attribut
                        });
                    }
                }
            }

            return {
                id: attribute.id,
                nom: attribute.nom,
                filters: Array.from(filterMap.values()),
                type: Array.from(filterMap.values()).some(filter => filter.couleur !== '') ? 'color' : 'attribute',
                productCount: generalProductCount
            };
        }));

        filterAttributes = [
            ...filterAttributes,
            ...prov_filterAttributes,
        ];

        
        // Récupération des marques dans une liste unique
        const marques = produits.map((produit: any) => produit.marques).filter(Boolean);
        // Éliminer les doublons basés sur l'ID
        const marquesUnique = marques.filter((marque: any, index: number, self: any[]) => 
            index === self.findIndex((m: any) => m && marque && m.id === marque.id)
        );
        const filterItemBrand = {
            id: 0,
            nom: 'Marque',
            filters: marquesUnique.map((marque: any) => {
                const productCount = produits.filter((produit: any) => 
                    produit.marques && marque && produit.marques.id === marque.id
                ).length || 0;
                
                return {
                    id: marque.id,
                    nom: marque.nom,
                    couleur: '',
                    productCount: productCount,
                    attribut_values: [{
                        id: marque.id,
                        id_attribut: 0,
                        nom: marque.nom
                    }]
                }
            }),
            type: 'brand'
        }
        filterAttributes.push(filterItemBrand);
        // Ajouter un filtre pour les prix
        filterAttributes.push({
            id: 0,
            nom: 'Prix',
            filters: [{
                id: 0,
                nom: 'Prix',
                couleur: '',
                attribut_values: [{
                    id: 0,
                    id_attribut: 0,
                    nom: 'De'
                }, {
                    id: 1,
                    id_attribut: 0,
                    nom: 'À'
                }],
            }],
            type: 'price'
        });

        return filterAttributes;
    }
}