import { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";
import { ICheckoutRepository } from "../../repositories/ICheckoutRepository";
import { Checkout, CheckoutLine, CheckoutPresenter, CreateCheckoutRequest } from "../../models/Checkout";
import { Client } from "../../models/Client";
import { ShopPresenter, ShopStatus, ShopLine } from "../../models/Shop";
import { PaymentMethod, DiscountType, CheckoutFilterType, CheckoutStatus, CheckoutInput } from "../../models/Checkout";
import { ModelProductDetail } from "../../models/Checkout";
import { CheckoutFilterInput } from "../../models/Checkout";
import { ActiveFilter, departmentsMap } from "../../types/utils";
import { BadRequestError, InternalServerError, NotFoundError } from "../../types/error";
import { ReturnAll } from "../../types/utils";
import { KeyMap, mapFromType, mapToType } from "./MapToType";
import { clientKeyMap } from "./ClientRepository";
import { ShopKeyMap, ShopLineKeyMap } from "./ShopRepository";
import { ModelAdmin } from "../../models/Model";
import { modelKeyMap } from "./ModelRepository";

export const CheckoutKeyMap: KeyMap<Checkout> = {
    id: 'id',
    idClient: 'id_client',
    idShop: 'id_point_vente',
    paymentMethod: 'mode_paiement',
    discountType: 'reduction_type',
    discountAmount: 'reduction',
    totalHT: 'total_ht',
    totalTTC: 'total',
    cbAmount: 'montant_cb',
    checkAmount: 'montant_cheque',
    cashAmount: 'montant_espece',
    NoVAT: 'tva_non_applicable',
    createdAt: 'date_creation',
    status: 'statut'
}

export const CheckoutLineKeyMap: KeyMap<CheckoutLine> = {
    id: 'id',
    idCheckout: 'id_caisse',
    idModel: 'id_modele',
    name: 'intitule',
    codeBar: 'code_barre',
    price: 'prix',
    quantity: 'quantite',
    discount: 'remise',
    discountType: 'reduction_type',
    VAT: 'tva',
    comment: 'comment',
    modelProduct: {
        key: 'modeles',
        transform: (value) => mapToType<ModelProductDetail>(value, ModelProductDetailKeyMap)
    }
}

export const ModelProductDetailKeyMap: KeyMap<ModelProductDetail> = {
    name: 'titre',
    attributs: 'attribut_valeurs',
    price: 'prix_vente_ht',
    image: 'image',
    codeBar: 'code_barre',
    stock: 'stock',
    minStock: 'stock_min',
    supplierReference: 'code_article_fournisseur',
    manufacturerReference: 'reference_fabricant'
}

const CheckoutShopsUsersKeyMap: KeyMap<CheckoutPresenter> = {
    id: 'id',
    idClient: 'id_client',
    idShop: 'id_point_vente',
    paymentMethod: 'mode_paiement',
    discountType: 'reduction_type',
    discountAmount: 'reduction',
    totalHT: 'total_ht',
    totalTTC: 'total',
    cbAmount: 'montant_cb',
    checkAmount: 'montant_cheque',
    cashAmount: 'montant_espece',
    NoVAT: 'tva_non_applicable',
    createdAt: 'date_creation',
    status: 'statut',
    shop: {
        key: 'point_ventes',
        transform: (value) => mapToType<ShopPresenter>(value, ShopKeyMap)
    },
    client: {
        key: 'clients',
        transform: (value) => mapToType<Client>(value, clientKeyMap)
    },
    lines: {
        key: 'caisse_lignes',
        transform: (value) => Array.isArray(value) ? value.map((v) => mapToType<CheckoutLine>(v, CheckoutLineKeyMap)) : []
    }
}

export const mapPaymentMethod : Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'ESPECE',
    [PaymentMethod.CHECK]: 'CHEQUE',
    [PaymentMethod.DEBIT_CARD]: 'CARTE',
    [PaymentMethod.CREDIT_CARD]: 'CARTE',
    [PaymentMethod.TRANSFER]: 'VIREMENT',
    [PaymentMethod.OTHER]: 'MIXTE'
}

export const mapDiscountType : Record<DiscountType, string> = {
    [DiscountType.PERCENTAGE]: 'POURCENTAGE',
    [DiscountType.FIXED]: 'MONTANT'
}

type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => any;
export const checkoutFilter: Record<CheckoutFilterType, FilterMappginFunction> = {
    [CheckoutFilterType.PAYMENT_METHOD]: (baseQuery, filter) => {
        const values = filter.values as string[];
        const filterValue = values.map(value => mapPaymentMethod[value as PaymentMethod] ?? value as string);         
        if(filterValue.includes('ESPECE') && !filterValue.includes('MIXTE')) {
            baseQuery.gt('montant_espece', 0);
        } else if(!filterValue.includes('MIXTE')) {
            baseQuery.eq('montant_espece', 0);
        }

        if(filterValue.includes('CHEQUE') && !filterValue.includes('MIXTE')) {
            baseQuery.gt('montant_cheque', 0);
        } else if(!filterValue.includes('MIXTE')) {
            baseQuery.eq('montant_cheque', 0);
        }

        if(filterValue.includes('CARTE') && !filterValue.includes('MIXTE')) {
            baseQuery.gt('montant_cb', 0);
        } else if(!filterValue.includes('MIXTE')) {
            baseQuery.eq('montant_cb', 0);
        }
        
        if(filterValue.includes('MIXTE')) {
            baseQuery.gt('montant_cb', 0).gt('montant_cheque', 0).gt('montant_espece', 0);
        }
        return baseQuery;
    },
    [CheckoutFilterType.DISCOUNT_TYPE]: (baseQuery, filter) => {
        const values = filter.values as string[];
        const filterValue = values.map(value => mapDiscountType[value as DiscountType] ?? value as string);
        return baseQuery.in('reduction_type', filterValue);
    },
    [CheckoutFilterType.STATUS]: (baseQuery, filter) => {
        const values = filter.values as string[];
        const filterValue = values.map(value => value as CheckoutStatus);
        return baseQuery.in('statut', filterValue);
    }
}

export class CheckoutRepository implements ICheckoutRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async readCheckouts() : Promise<Checkout[]> {
        const { data, error } = await this.supabase.from('caisse').select('*');
        if (error) {
            throw new InternalServerError(error.message);
        }
        const checkouts = data.map((item) => mapToType<Checkout>({
            ...item,
            shop: {
                ...item.point_ventes,
                lines: []
            },
            client: {
                ...item.clients
            }
        }, CheckoutKeyMap));

        return checkouts;
    }

    async readCheckoutsByShopId(shopId: number) : Promise<ReturnAll<Checkout>> {
        const { data, error } = await this.supabase.from('caisses').select('*', { count: 'exact' }).eq('id_point_vente', shopId);
        if (error) {
            throw new InternalServerError(error.message);
        }
        const checkouts : Checkout[] = data.map((item) => mapToType<Checkout>(item, CheckoutKeyMap));
        return {
            items: checkouts,
            total: data.length,
            count: data.length
        };
    }

    async readCheckoutsShopsUsers(options?: CheckoutFilterInput) : Promise<ReturnAll<CheckoutPresenter>> {
        const { limit, offset, sort, search, filters } = options || {};
        
        // Build base query with all necessary fields
        let query = this.supabase
            .from('caisses')
            .select('*, point_ventes(id, nom, date_fin, actif, statut, numero_departement), clients(numero_client, nom, prenom, email)', { count: 'exact' });

        // Apply filters first
        if (filters) {            
            filters.forEach(filter => {
                const filterKey = filter.key as CheckoutFilterType;
                if (checkoutFilter[filterKey]) {
                    checkoutFilter[filterKey](query, filter);
                }
            });
        }

        // Apply search filter at database level if possible
        if (search && search.trim() !== '') {
            const searchLower = search.toLowerCase();
            const searchNumber = parseInt(search);
            
            // If search is a valid number, search by ID
            if (!Number.isNaN(searchNumber)) {
                query = query.eq('id', searchNumber);
            } else {
                // Search in related tables using OR conditions
                //query = query.or(`point_ventes.nom.ilike.%${search}%,point_ventes.numero_departement.ilike.%${search}%,clients.nom.ilike.%${search}%,clients.prenom.ilike.%${search}%,clients.email.ilike.%${search}%`);
            }
        }

        // Apply pagination only if no search or if search is applied at DB level
        if (!search || search.trim() === '' || !Number.isNaN(parseInt(search))) {
            const startOffset = (offset ?? 0) * (limit ?? Number.MAX_SAFE_INTEGER);
            const endOffset = startOffset + (limit ?? Number.MAX_SAFE_INTEGER) - 1;
            query = query.range(startOffset, endOffset);
        }

        // Execute query with ordering
        const { data: caissesList, error, count } = await query.order('id', { ascending: sort === 'asc' });
        
        if (error) {
            throw new InternalServerError(error.message);
        }

        // Apply client-side search filtering if needed (for complex search scenarios)
        let filteredData = caissesList;
        if (search && search.trim() !== '' && Number.isNaN(parseInt(search))) {
            const searchLower = search.toLowerCase();
            filteredData = caissesList.filter(caisse => 
                (caisse.point_ventes && 
                    (caisse.point_ventes.nom?.toLowerCase().includes(searchLower) || 
                    (caisse.point_ventes.numero_departement &&
                        departmentsMap[caisse.point_ventes.numero_departement as keyof typeof departmentsMap]?.toLowerCase().includes(searchLower))
                    )
                ) || 
                (caisse.clients && 
                    (caisse.clients.nom.toLowerCase().includes(searchLower) || 
                     caisse.clients.prenom.toLowerCase().includes(searchLower) || 
                     caisse.clients.email.toLowerCase().includes(searchLower))
                )
            );
        }

        // Transform data efficiently
        const checkouts = filteredData.map((item) => {
            const itemCheckout = {
                id: item.id,
                id_client: item.id_client,
                id_point_de_vente: item.id_point_vente,
                mode_paiement: item.mode_paiement,
                reduction_type: item.reduction_type,
                reduction: item.reduction?.toString() || '0',
                total_ht: item.total_ht?.toString() || '0',
                total: item.total?.toString() || '0',
                montant_cb: item.montant_cb?.toString() || '0',
                montant_cheque: item.montant_cheque?.toString() || '0',
                montant_espece: item.montant_espece?.toString() || '0',
                tva_non_applicable: item.tva_non_applicable,
                statut: item.statut === 'FINALISE' ? CheckoutStatus.CLOSED : 
                        item.statut === 'ACTIF' ? CheckoutStatus.OPEN : '',
                date_creation: new Date(item.date_creation).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                point_ventes: {
                    ...item.point_ventes,
                    lines: []
                },
                clients: {
                    ...item.clients
                }
            };                
            
            return mapToType<CheckoutPresenter>(itemCheckout, CheckoutShopsUsersKeyMap);
        });        

        return {
            items: checkouts,
            total: count ?? checkouts.length,
            count: checkouts.length
        };
    }

    async readCheckoutLinesByCheckoutId(checkoutId: number) : Promise<CheckoutLine[]> {
        const { data, error } = await this.supabase.from('caisse_ligne').select('*').eq('id_caisse', checkoutId);
        if (error) {
            throw new InternalServerError(error.message);
        }
        const checkoutLines = data.map((item) => mapToType<CheckoutLine>({
            ...item
        }, CheckoutLineKeyMap));

        return checkoutLines;
    }

    async readCheckoutByDateInterval(startDate: Date, endDate: Date) : Promise<CheckoutPresenter[]> {
        const { data, error } = await this.supabase.from('caisses')
            .select('*, point_ventes(id, nom, date_fin, actif, statut, numero_departement) \
                , clients(numero_client, nom, prenom, email) \
                , caisse_lignes(id, id_modele, intitule, code_barre, prix, quantite, remise, tva, comment, reduction_type)', { count: 'exact' })
            .gte('date_creation', startDate.toISOString())
            .lte('date_creation', endDate.toISOString());
        
        if (error) {
            throw new InternalServerError(error.message);
        }
        let checkouts = data.map((item) => mapToType<CheckoutPresenter>(item, CheckoutShopsUsersKeyMap));
        checkouts = checkouts.map((checkout) => ({
            ...checkout,
            paymentMethod: checkout.paymentMethod.toLowerCase() === "carte" ? PaymentMethod.DEBIT_CARD : 
                    checkout.paymentMethod.toLowerCase() === "cheque" ? PaymentMethod.CHECK : 
                        checkout.paymentMethod.toLowerCase() === "espece" ? PaymentMethod.CASH : 
                            PaymentMethod.OTHER 
        }));

        return checkouts;
    }

    async createCheckout(checkout: CreateCheckoutRequest) : Promise<Checkout> {
        const shop = await this.supabase.from('point_ventes').select('*').eq('id', checkout.idShop).single();
        if (!shop) {
            throw new NotFoundError('Shop not found');
        }
        if(shop.data.statut !== ShopStatus.OPEN) {
            throw new BadRequestError('Shop is not open');
        }
        let client = await this.supabase.from('clients').select('*').eq('numero_client', checkout.idClient).single();
        if (!client) {
            console.log('Caisse créée sans client');
        }

        const isPaymentCash = checkout.cashAmount && parseFloat(checkout.cashAmount.toString()) > 0;
        const isPaymentCheck = checkout.checkAmount && parseFloat(checkout.checkAmount.toString()) > 0;
        const isPaymentCard = checkout.cbAmount && parseFloat(checkout.cbAmount.toString()) > 0;
        const isPaymentMixed = isPaymentCash && isPaymentCard && isPaymentCheck;

        const newCheckout = {
            idClient: client.data ? checkout.idClient : 41886,
            idShop: checkout.idShop,
            paymentMethod: isPaymentMixed ? 'MIXTE' : isPaymentCash ? 'ESPECE' : isPaymentCheck ? 'CHEQUE' : isPaymentCard ? 'CARTE' : '',
            discountType: checkout.discountType === DiscountType.PERCENTAGE ? 'POURCENTAGE' : 'MONTANT',
            discountAmount: checkout.discountAmount ? checkout.discountAmount.toString() : '0',
            totalHT: checkout.totalHT ? parseFloat(checkout.totalHT.toString()) : 0,
            totalTTC: checkout.totalTTC ? parseFloat(checkout.totalTTC.toString()) : 0,
            cbAmount: checkout.cbAmount ? parseFloat(checkout.cbAmount.toString()) : 0,
            checkAmount: checkout.checkAmount ? parseFloat(checkout.checkAmount.toString()) : 0,
            cashAmount: checkout.cashAmount ? parseFloat(checkout.cashAmount.toString()) : 0,
            NoVAT: checkout.NoVAT,
            status: checkout.status === CheckoutStatus.OPEN ? 'ACTIF' : checkout.status === CheckoutStatus.CLOSED ? 'FINALISE' : ''
        };

        const { data : checkoutData, error : checkoutError } = await this.supabase.from('caisses').insert(mapFromType(newCheckout, CheckoutKeyMap)).select().single();
        if (checkoutError) {    
            throw new InternalServerError(checkoutError.message);
        }

        const checkoutLines : any[] = [];
        const shopLinesToUpdate : ShopLine[] = [];
        if(checkout.lines && checkout.lines.length > 0) {
            for(const line of checkout.lines) {
                const model = await this.supabase.from('modeles').select('*').eq('id', line.idModel).single();
                if (!model) {
                    throw new NotFoundError('Model not found');
                }
                checkoutLines.push({
                    idCheckout: checkoutData.id,
                    idModel: line.idModel,
                    name: line.name,
                    codeBar: line.codeBar,
                    price: line.price,
                    quantity: line.quantity,
                    discount: parseFloat(line.discount),
                    discountType: line.discountType === DiscountType.PERCENTAGE ? 'POURCENTAGE' : 'MONTANT',
                    VAT: line.VAT,
                    comment: line.comment
                });
                let shopLine = await this.supabase.from('point_vente_lignes')
                    .select('*')
                    .eq('id_modele', line.idModel)
                    .eq('id_point_vente', checkout.idShop)
                    .single();
                if (shopLine.error) {
                    // Use UPSERT to handle the case where the record might already exist
                    const { data: upsertData, error: upsertError } = await this.supabase.from('point_vente_lignes')
                        .upsert({
                            id_modele: line.idModel,
                            id_point_vente: checkout.idShop,
                            stock_initial: 0,
                            stock_vendu: 0,
                            prix_total_ttc: 0
                        }, { 
                            onConflict: 'id_modele,id_point_vente' 
                        })
                        .select()
                        .single();
                    
                    if (upsertError) {
                        console.log('>>>> UPSERT ERROR ', upsertError);
                        throw new InternalServerError(upsertError.message as string);
                    }
                    
                    shopLine = { data: upsertData, error: null, count: null, status: 200, statusText: 'OK' };
                }

                const shopLineToUpdate = {
                    idModel: line.idModel,
                    idShop: checkout.idShop,
                    initialQuantity: shopLine.data.stock_initial,
                    soldQuantity: shopLine.data.stock_vendu + line.quantity,
                    finalQuantity: shopLine.data.stock_initial - line.quantity,
                    totalPriceTTC: shopLine.data.prix_total_ttc + (line.price * line.quantity * (1 + line.VAT / 100))
                };
                if(shopLineToUpdate.finalQuantity < 0) {
                    console.log('Stock final is negative for model: ', line.idModel);
                }
                shopLinesToUpdate.push(shopLineToUpdate);
            }
        }    
        
        if(checkoutLines.length > 0 && shopLinesToUpdate.length === checkoutLines.length) {
            const checkoutLinesToInsert = checkoutLines.map(line => mapFromType(line, CheckoutLineKeyMap));
            const { data : checkoutLinesData, error : checkoutLinesError } = await this.supabase.from('caisse_lignes').insert(checkoutLinesToInsert).select();
            if (checkoutLinesError) {
                throw new InternalServerError(checkoutLinesError.message as string);
            }
            if(checkoutLinesData.length !== checkoutLines.length) {
                throw new InternalServerError('Checkout lines not created');
            }

            const { data : shopLinesData, error : shopLinesError } = await this.supabase.from('point_vente_lignes')
                .upsert(shopLinesToUpdate.map(line => mapFromType(line, ShopLineKeyMap)), {
                    onConflict: 'id_modele,id_point_vente'
                });
            if (shopLinesError) {
                throw new InternalServerError(shopLinesError.message as string);
            }
        }

        return mapToType<Checkout>({
            ...checkoutData,
            reduction_type: checkoutData.reduction_type === 'POURCENTAGE' ? DiscountType.PERCENTAGE : DiscountType.FIXED,
            mode_paiement: checkoutData.mode_paiement === 'ESPECE' ? PaymentMethod.CASH : checkoutData.mode_paiement === 'CHEQUE' ? PaymentMethod.CHECK : checkoutData.mode_paiement === 'CARTE' ? PaymentMethod.DEBIT_CARD : PaymentMethod.OTHER,
        }, CheckoutKeyMap);
    }

    async readCheckoutById(id: number) : Promise<CheckoutPresenter> {
        const checkout = await this.supabase.from('caisses').select('*, point_ventes(id, nom, date_fin, actif, statut, numero_departement), clients(numero_client, nom, prenom, email, clubs:id_club_adherent(*))').eq('id', id).single();
        if (checkout.error) {
            throw new NotFoundError(checkout.error.message);
        }

        const checkoutLines = await this.supabase.from('caisse_lignes').select('*').eq('id_caisse', id);
        if (checkoutLines.error) {
            throw new NotFoundError(checkoutLines.error.message);
        }

        const checkoutLinesWithProductDetail = await this.supabase.from('caisse_lignes').select('*, modeles(id, prix_vente_ht, produits(id, prix_vente_ht, tva, produit_descriptions(titre, lang)), modele_attribut_valeurs(id_attribut_valeur, attribut_valeurs(nom)))').eq('id_caisse', id).eq('modeles.produits.produit_descriptions.lang', 'fr');
        if (checkoutLinesWithProductDetail.error) {
            throw new NotFoundError(checkoutLinesWithProductDetail.error.message);
        }

        const mapIdModeleProductImages = new Map<number, string>();
        for(const lineToFind of checkoutLines.data) {
            const productImageRequest = this.supabase.from('produit_images')
                .select('url')
                .eq('id_produit', checkoutLinesWithProductDetail.data.find(l => l.id_modele === lineToFind.id_modele)?.modeles.produits.id);               

            if(checkoutLinesWithProductDetail.data.find(l => l.id_modele === lineToFind.id_modele)?.modeles.modele_attribut_valeurs.length > 1) {
                productImageRequest.in('id_attribut_valeur', checkoutLinesWithProductDetail.data.find(l => l.id_modele === lineToFind.id_modele)?.modeles.modele_attribut_valeurs.map((a: { id_attribut_valeur: number }) => a.id_attribut_valeur));
            }
            const productImage = await productImageRequest;
            if(productImage.error) {
                console.log('Product image error:', productImage.error);
            }
            if(productImage.data && productImage.data.length > 0) {
                mapIdModeleProductImages.set(lineToFind.id_modele, productImage.data[0]?.url);
            }
        }

        let shopLines: PostgrestSingleResponse<any[]> = { data: [], error: null, count: null, status: 200, statusText: 'OK' };
        if(checkout.data.id_point_vente) {
            const shopLinesReq = this.supabase.from('point_vente_lignes').select('*').eq('id_point_vente', checkout.data.id_point_vente);
            if(checkoutLines.data.map(line => line.id_modele).length > 0) {
                shopLinesReq.in('id_modele', checkoutLines.data.map(line => line.id_modele));
            }
            shopLines = await shopLinesReq;
            if (shopLines.error) {
                throw new NotFoundError(shopLines.error.message);
            }
            const modelesAdmin = await this.supabase
                .from('modeles')
                .select('*, modeles_admin!inner(*)')
                .in('id', checkoutLines.data.map(line => line.id_modele));

            const modelesAdminData = modelesAdmin.data
                ? modelesAdmin.data.map((model: any) => mapToType<ModelAdmin>(model, modelKeyMap))
                : [];
            
            const checkoutPresenter : CheckoutPresenter = {
                ...checkout.data,
                reduction_type: checkout.data.reduction_type === 'POURCENTAGE' ? DiscountType.PERCENTAGE : DiscountType.FIXED,
                reduction: checkout.data.reduction ? checkout.data.reduction.toString() : '0',
                mode_paiement: checkout.data.mode_paiement === 'ESPECE' ? PaymentMethod.CASH : checkout.data.mode_paiement === 'CHEQUE' ? PaymentMethod.CHECK : checkout.data.mode_paiement === 'CARTE' ? PaymentMethod.DEBIT_CARD : PaymentMethod.OTHER,            
                totalHT: checkout.data.total_ht ? checkout.data.total_ht.toString() : '0',
                totalTTC: checkout.data.total ? checkout.data.total.toString() : '0',
                cbAmount: checkout.data.montant_cb ? checkout.data.montant_cb.toString() : '0',
                checkAmount: checkout.data.montant_cheque ? checkout.data.montant_cheque.toString() : '0',
                cashAmount: checkout.data.montant_espece ? checkout.data.montant_espece.toString() : '0',
                createdAt: new Date(checkout.data.date_creation).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                shop: {
                    ...checkout.data.point_ventes,
                    lines: shopLines.data.map(line => mapToType<ShopLine>(line, ShopLineKeyMap))
                },
                client: {
                    ...checkout.data.clients
                }
            };
            

            const checkoutPresenterMapped = mapToType<CheckoutPresenter>(checkoutPresenter, CheckoutShopsUsersKeyMap);        

            return {
                ...checkoutPresenterMapped,
                lines: checkoutLines.data.map(line => {
                    const chckoutLine : CheckoutLine = mapToType<CheckoutLine>({
                        ...line,
                        reduction_type: line.reduction_type === 'POURCENTAGE' ? DiscountType.PERCENTAGE : DiscountType.FIXED,
                        modeles: {
                            titre: checkoutLinesWithProductDetail.data.find(l => l.id_modele === line.id_modele)?.modeles.produits.produit_descriptions[0].titre || '',
                            attribut_valeurs: checkoutLinesWithProductDetail.data.find(l => l.id_modele === line.id_modele)?.modeles.modele_attribut_valeurs.map((a: { attribut_valeurs: { nom: string } }) => a.attribut_valeurs.nom) || [],
                            prix_vente_ht: checkoutLinesWithProductDetail.data.find(l => l.id_modele === line.id_modele)?.modeles.produits.prix_vente_ht || 0,
                            image: mapIdModeleProductImages.get(line.id_modele) ? `/api/assets/${mapIdModeleProductImages.get(line.id_modele)}` : '',
                            code_barre: modelesAdminData.find(m => m.id === line.id_modele)?.barcode || '',
                            code_article_fournisseur: modelesAdminData.find(m => m.id === line.id_modele)?.supplierReference || '',
                            reference_fabricant: modelesAdminData.find(m => m.id === line.id_modele)?.manufacturerReference || ''
                        }
                    }, CheckoutLineKeyMap);
                    return chckoutLine;
                })
            };
        } else {
            throw new NotFoundError("Aucun point vente n'est associé à cette caisse");
        }
    }

    async deleteCheckout(id: number) : Promise<void> {
        // Get checkout
        const checkout = await this.supabase.from('caisses').select('*').eq('id', id).single();
        if (checkout.error) {
            throw new NotFoundError(checkout.error.message);
        }

        const checkoutObject = mapToType<Checkout>(checkout.data, CheckoutKeyMap);

       // Get sold quantity of each model to update shop lines
        const checkoutLines = await this.supabase.from('caisse_lignes').select('*').eq('id_caisse', id);
        if (checkoutLines.error) {
            throw new NotFoundError(checkoutLines.error.message);
        }

        // Get shop lines to update
        const shopLines = await this.supabase.from('point_vente_lignes').select('*').eq('id_point_vente', checkoutObject.idShop).in('id_modele', checkoutLines.data.map(line => line.id_modele));
        if (shopLines.error) {
            throw new NotFoundError(shopLines.error.message);
        }

        // Update shop lines
        const shopLinesToUpdate = shopLines.data.map(line => {
            return {
                ...line,
                stock_vendu: line.stock_vendu - checkoutLines.data.find(l => l.id_modele === line.id_modele)?.quantite || 0,
                stock_final: line.stock_initial - line.stock_vendu + checkoutLines.data.find(l => l.id_modele === line.id_modele)?.quantite || 0,
                prix_total_ttc: line.prix_total_ttc - checkoutLines.data.find(l => l.id_modele === line.id_modele)?.prix * checkoutLines.data.find(l => l.id_modele === line.id_modele)?.quantite * (checkoutObject.NoVAT ? 1 : 1 + checkoutLines.data.find(l => l.id_modele === line.id_modele)?.tva / 100) || 0
            }
        });

        if(shopLinesToUpdate.length > 0) {
            const { data : shopLinesData, error : shopLinesError } = await this.supabase.from('point_vente_lignes')
                .upsert(shopLinesToUpdate, {
                    onConflict: 'id_modele,id_point_vente'
                });
            if (shopLinesError) {
                throw new InternalServerError(shopLinesError.message as string);
            }

            // delete the shop lines that are 0 in stock
            const { error: shopLinesErrorDelete } = await this.supabase.from('point_vente_lignes').delete()
                .eq('id_point_vente', checkoutObject.idShop)
                .eq('stock_vendu', 0)
                .eq('stock_initial', 0)
                .eq('stock_final', 0);
            if (shopLinesErrorDelete) {
                throw new InternalServerError(shopLinesErrorDelete.message);
            }
        }

        // delete checkout lines
        const { data : checkoutLinesData, error : checkoutLinesError } = await this.supabase.from('caisse_lignes').delete().eq('id_caisse', id);
        if (checkoutLinesError) {
            throw new InternalServerError(checkoutLinesError.message);
        }       
        
        // delete checkout
        const { data, error } = await this.supabase.from('caisses').delete().eq('id', id);
        if (error) {
            throw new InternalServerError(error.message);
        }
    }    

    // This method is used to update the checkout status only
    async updateCheckout(id: number, checkout: CheckoutInput) : Promise<Checkout> {
        //start by updating the checkout lines
        if(checkout.lines && checkout.lines.length > 0) {
            // get the checkout lines
            const { data: oldCheckoutLinesData, error: oldCheckoutLinesError } = await this.supabase.from('caisse_lignes').select('*').eq('id_caisse', id);
            if (oldCheckoutLinesError) {
                throw new InternalServerError(oldCheckoutLinesError.message);
            }

            // get the shop lines
            const shopLines = await this.supabase.from('point_vente_lignes')
                .select('*')
                .eq('id_point_vente', checkout.idShop);
            if (shopLines.error) {
                console.log('1 >>>> shopLines error: ', shopLines.error);
                throw new InternalServerError(shopLines.error.message);
            }

            // remove the old checkout lines quantity from the shop lines
            const oldCheckoutLinesDataToUpdate = oldCheckoutLinesData.filter(line => shopLines.data.find(l => l.id_modele === line.id_modele)).map(line => {
                return {
                    id_modele: line.id_modele,
                    id_point_vente: checkout.idShop,
                    stock_vendu: shopLines.data.find(l => l.id_modele === line.id_modele)?.stock_vendu - line.quantite,
                    stock_final: shopLines.data.find(l => l.id_modele === line.id_modele)?.stock_initial - shopLines.data.find(l => l.id_modele === line.id_modele)?.stock_vendu + line.quantite,
                    prix_total_ttc: (shopLines.data.find(l => l.id_modele === line.id_modele)?.stock_vendu - line.quantite) * line.prix * (1 + line.tva / 100)
                }
            });

            const { error: shopLinesError } = await this.supabase.from('point_vente_lignes').upsert(
                oldCheckoutLinesDataToUpdate, {
                    onConflict: 'id_modele,id_point_vente'
                }
            );
            if (shopLinesError) {
                console.log('2>>>> shopLines error: ', shopLinesError);
                throw new InternalServerError(shopLinesError.message);
            }

            // delete the shop lines that are 0 in stock
            const { error: shopLinesErrorDelete } = await this.supabase.from('point_vente_lignes').delete()
                .eq('id_point_vente', checkout.idShop)
                .eq('stock_vendu', 0)
                .eq('stock_initial', 0)
                .eq('stock_final', 0);
            if (shopLinesErrorDelete) {
                console.log('>>>> shopLinesErrorDelete: ', shopLinesErrorDelete);
                throw new InternalServerError(shopLinesErrorDelete.message);
            }

            // delete  all the checkout lines concerning the checkout
            const { error: checkoutLinesError } = await this.supabase.from('caisse_lignes').delete().eq('id_caisse', id);
            if (checkoutLinesError) {
                throw new InternalServerError(checkoutLinesError.message);
            }

            // insert the new checkout lines passed in the request
            const checkoutLinesToInsert = checkout.lines.map(line => mapFromType(line, CheckoutLineKeyMap));
            const mappedCheckoutLinesToInsert = checkoutLinesToInsert.map(line => {
                return {
                    id_caisse: id,
                    intitule: line.intitule,
                    code_barre: line.code_barre,
                    id_modele: line.id_modele,
                    quantite: line.quantite,
                    prix: line.prix,
                    tva: line.tva,
                    reduction_type: line.reduction_type,
                    remise: line.reduction ?? 0,
                    comment: line.comment,
                    prix_ht: line.prix * line.quantite
                }
            });
            const { data: newCheckoutLinesDataInserted, error: newCheckoutLinesErrorInserted } = await this.supabase
                .from('caisse_lignes')
                .upsert(mappedCheckoutLinesToInsert)
                .eq('id_caisse', id)
                .select();
            if (newCheckoutLinesErrorInserted) {
                console.log('>>>> newCheckoutLinesErrorInserted: ', 
                    newCheckoutLinesErrorInserted, 
                    " | ",
                    mappedCheckoutLinesToInsert
                );
                throw new InternalServerError(newCheckoutLinesErrorInserted.message);
            }

            // select from shop lines the ones that are not in the new checkout lines
            const concernedShopLines = await this.supabase
                .from('point_vente_lignes')
                .select('*')
                .eq('id_point_vente', checkout.idShop)
                .in('id_modele', newCheckoutLinesDataInserted.map(line => line.id_modele));
            if (concernedShopLines.error) {
                console.log('>>>> concernedShopLines error: ', concernedShopLines.error);
                throw new InternalServerError(concernedShopLines.error.message);
            }

            // update the concerned shop lines
            const updatedShopLines = concernedShopLines.data.map(line => {
                return {                    
                    id_modele: line.id_modele,
                    id_point_vente: checkout.idShop,
                    stock_vendu: line.stock_vendu + newCheckoutLinesDataInserted.find(l => l.id_modele === line.id_modele)?.quantite,
                    stock_final: line.stock_initial - line.stock_vendu + newCheckoutLinesDataInserted.find(l => l.id_modele === line.id_modele)?.quantite,
                    prix_total_ttc: (line.stock_vendu + newCheckoutLinesDataInserted.find(l => l.id_modele === line.id_modele)?.quantite) * newCheckoutLinesDataInserted.find(l => l.id_modele === line.id_modele)?.prix * (1 + newCheckoutLinesDataInserted.find(l => l.id_modele === line.id_modele)?.tva / 100)
                }
            });
            if(updatedShopLines.length > 0) {
                const { error: shopLinesErrorInserted } = await this.supabase.from('point_vente_lignes').upsert(
                    updatedShopLines, {
                        onConflict: 'id_modele,id_point_vente'
                    }
                );
                if (shopLinesErrorInserted) {
                    console.log('>>>> shopLinesErrorInserted: ', shopLinesErrorInserted, " | ", updatedShopLines);
                    throw new InternalServerError(shopLinesErrorInserted.message);
                }
            }

            // add the remaining shop lines
            const remainingShopLines = newCheckoutLinesDataInserted.filter(line => !concernedShopLines.data.find(l => l.id_modele === line.id_modele)).map(line => {
                return {
                    id_modele: line.id_modele,
                    id_point_vente: checkout.idShop,
                    stock_vendu: line.quantite,
                    stock_initial: 0,
                    stock_final: -line.quantite,
                    prix_total_ttc: line.prix * line.quantite * (1 + line.tva / 100)
                }
            });
            if(remainingShopLines.length > 0) {
                const { error: shopLinesErrorInserted } = await this.supabase.from('point_vente_lignes').upsert(
                    remainingShopLines, {
                        onConflict: 'id_modele,id_point_vente'
                    }
                );
                if (shopLinesErrorInserted) {
                    console.log('>>>> shopLinesErrorInserted: ', shopLinesErrorInserted, " | ", remainingShopLines);
                    throw new InternalServerError(shopLinesErrorInserted.message);
                }
            }
        }

        const { data: checkoutToUpdate, error: checkoutError } = await this.supabase.from('caisses').select('*').eq('id', id).single();
        if (checkoutError) {
            throw new NotFoundError('Checkout not found');
        }
        const updatedCheckout = {
            id: checkoutToUpdate.id,
            id_client: checkoutToUpdate.id_client,
            id_point_vente: checkoutToUpdate.id_point_vente,
            reduction: checkout.discountAmount ? parseFloat(checkout.discountAmount.toString()) : checkoutToUpdate.reduction,
            reduction_type: checkout.discountType === DiscountType.PERCENTAGE ? 'POURCENTAGE' : 'MONTANT',
            date_creation: checkoutToUpdate.date_creation,
            total_ht: checkout.totalHT ? parseFloat(checkout.totalHT.toString()) : checkoutToUpdate.total_ht,
            total: checkout.totalTTC ? parseFloat(checkout.totalTTC.toString()) : checkoutToUpdate.total,
            montant_cb: checkout.cbAmount ? parseFloat(checkout.cbAmount.toString()) : checkoutToUpdate.montant_cb,
            montant_cheque: checkout.checkAmount ? parseFloat(checkout.checkAmount.toString()) : checkoutToUpdate.montant_cheque,
            montant_espece: checkout.cashAmount ? parseFloat(checkout.cashAmount.toString()) : checkoutToUpdate.montant_espece,
            tva_non_applicable: checkout.NoVAT ? checkout.NoVAT : checkoutToUpdate.tva_non_applicable,
            mode_paiement: checkout.paymentMethod === PaymentMethod.CASH ? 'ESPECE' : checkout.paymentMethod === PaymentMethod.CHECK ? 'CHEQUE' : checkout.paymentMethod === PaymentMethod.DEBIT_CARD ? 'CARTE' : 'MIXTE',
            statut: checkout.status === CheckoutStatus.OPEN ? 'ACTIF' : checkout.status === CheckoutStatus.CLOSED ? 'FINALISE' : ''
        };
        
        const { data, error } = await this.supabase.from('caisses').update(updatedCheckout).eq('id', id).select('*').single();
        if (error) {
            throw new InternalServerError(error.message);
        }
        if (!data) {
            throw new NotFoundError('Checkout not found');
        }

        const newCheckout : Checkout = {
            ...data,
            statut: data.statut === 'ACTIF' ? CheckoutStatus.OPEN : data.statut === 'FINALISE' ? CheckoutStatus.CLOSED : '',
            mode_paiement: data.mode_paiement === 'ESPECE' ? PaymentMethod.CASH : data.mode_paiement === 'CHEQUE' ? PaymentMethod.CHECK : data.mode_paiement === 'CARTE' ? PaymentMethod.DEBIT_CARD : PaymentMethod.OTHER,
            reduction_type: data.reduction_type === 'POURCENTAGE' ? DiscountType.PERCENTAGE : DiscountType.FIXED,
            reduction: data.reduction ? data.reduction.toString() : '0',
            totalHT: data.total_ht ? `${data.total_ht}` : '0',
            totalTTC: data.total ? `${data.total}` : '0',
            cbAmount: data.montant_cb ? `${data.montant_cb}` : '0',
            checkAmount: data.montant_cheque ? `${data.montant_cheque}` : '0',
            cashAmount: data.montant_espece ? `${data.montant_espece}` : '0',
            NoVAT: data.tva_non_applicable,
            createdAt: new Date(data.date_creation).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        return mapToType<Checkout>(newCheckout, CheckoutKeyMap);
    }
}