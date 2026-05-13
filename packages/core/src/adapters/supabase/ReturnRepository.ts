import { SupabaseClient } from "@supabase/supabase-js";
import { 
    Client, ModelProductDetail, OrderPresenter, Return, 
    ReturnFilterInput, ReturnFilterType, ReturnInput, ReturnLineInput, ReturnLinePresenter, 
    ReturnPresenterInput, 
    ReturnStatus
} from "../../models";
import { IReturnRepository } from "../../repositories/IReturnRepository";
import { InternalServerError, NotFoundError } from "../../types/error";
import { KeyMap, mapFromType, mapToType } from "./MapToType";
import { ActiveFilter, ReturnAll, ReturnOne } from "../../types";
import { ReturnPresenter } from "../../models";
import { clientKeyMap } from "./ClientRepository";
import { ModelProductDetailKeyMap } from "./CheckoutRepository";
import { orderPresenterKeyMap } from "./OrderRepository";


export const returnKeyMap:KeyMap<Return>={
    id: "id",
    id_commande: "id_commande",
    type_retour: "type_retour",
    date_demande: "date_demande",
    date_reception: "date_reception",
    numero_suivi: "numero_suivi",
    numero_prise_en_charge: "numero_prise_en_charge",
    cab_routage: "cab_routage",
    date_commande_recu_le: "date_commande_recu_le",
    motif_retour: "motif_retour",
    date_remboursement: "date_remboursement",
    date_reexpedition: "date_reexpedition",
    etat: "etat"
}

export const returnInputKeyMap:KeyMap<ReturnInput> = {
    orderId: "id_commande",
    type: "type_retour",
    status: "etat",
    requestDate: "date_demande",
    returnReason: "motif_retour",
    receivedDate: "date_reception",
    trackingNumber: "numero_suivi",
    supportNumber: "numero_prise_en_charge",
    routingDebitCard: "cab_routage",
    commandReceptionDate: "date_commande_recu_le",
    repaymentDate: "date_remboursement",
    reexpeditionDate: "date_reexpedition"
}

export const returnLineInputKeyMap:KeyMap<ReturnLineInput> = {
    returnId: "id_retour",
    modelId: "id_modele",
    quantity: "quantite",
    name: "intitule",
    exchangeModelId: "id_modele_echange",
    returnReason: "motif_retour"
}

export const returnLinePresenterKeyMap:KeyMap<ReturnLinePresenter> = {
    id: "id",
    returnId: "id_retour",
    modelId: "id_modele",
    model: {
        key: 'modeles',
        transform: (value) => mapToType<ModelProductDetail>(value, ModelProductDetailKeyMap)
    },
    quantity: "quantite",
    name: "intitule",
    exchangeModelId: "id_modele_echange",
    exchangeModel: {
        key: 'modeles_echange',
        transform: (value) => mapToType<ModelProductDetail>(value, ModelProductDetailKeyMap)
    },
    returnReason: "motif_retour"
}


export const returnPresenterKeyMap:KeyMap<ReturnPresenter> = {
    id: 'id',
    orderId: 'id_commande',
    type: 'type_retour',
    status: 'etat',
    requestDate: 'date_demande',
    receivedDate: 'date_reception',
    trackingNumber: 'numero_suivi',
    supportNumber: 'numero_prise_en_charge',
    routingDebitCard: 'cab_routage',
    commandReceptionDate: 'date_commande_recu_le',
    returnReason: 'motif_retour',
    repaymentDate: 'date_remboursement',
    reexpeditionDate: 'date_reexpedition',
    order: {
        key: 'commandes',
        transform: (value) => mapToType<OrderPresenter>(value, orderPresenterKeyMap)
    },
    client: {
        key: 'clients',
        transform: (value) => mapToType<Client>(value, clientKeyMap)
    },
    lines: {
        key: 'retours_lignes',
        transform: (value) => Array.isArray(value) ? value.map(item => mapToType<ReturnLinePresenter>(item, returnLinePresenterKeyMap)) : []
    }
}

type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => any;
export const returnFilter: Record<ReturnFilterType, FilterMappginFunction> = {
    [ReturnFilterType.STATUS]: (baseQuery, filter) => {
        const values = filter.values as string[];
        return baseQuery.in('etat', values);
    },
    [ReturnFilterType.TYPE]: (baseQuery, filter) => {
        const values = filter.values as string[];
        return baseQuery.in('type_retour', values);
    }
}


export class ReturnRepository implements IReturnRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async read(orderIds: number[]): Promise<Return[]> {
       const { data, error } = await this.supabase.from('retours')
        .select('*')
        .in('id_commande', orderIds)
        if (error) {
            throw new NotFoundError(error.message);
        }
           
       return data.map(returns => mapToType<Return>(returns, returnKeyMap))
    }

    async createReturn(returnData: ReturnPresenterInput): Promise<ReturnOne<ReturnPresenter>> {
        const { data, error } = await this.supabase.from('retours').insert(mapFromType<ReturnInput>({
            orderId: returnData.orderId,
            type: returnData.type,
            status: returnData.status,
            requestDate: returnData.requestDate,
            returnReason: returnData.returnReason,
            receivedDate: returnData.receivedDate,
            trackingNumber: returnData.trackingNumber,
            supportNumber: returnData.supportNumber,
            routingDebitCard: returnData.routingDebitCard,
            commandReceptionDate: returnData.commandReceptionDate,
            repaymentDate: returnData.repaymentDate,
            reexpeditionDate: returnData.reexpeditionDate
        }, returnInputKeyMap)).select("*").single();
        if(error) {
            throw new InternalServerError(error.message);
        }

        const { data: retourLignes, error: retourLignesError } = await this.supabase.from('retours_lignes').insert(returnData.lines.map((line: ReturnLineInput) => mapFromType<ReturnLineInput>({
            returnId: data.id,
            modelId: line.modelId,
            quantity: line.quantity,
            name: line.name,
            exchangeModelId: line.exchangeModelId,
            returnReason: line.returnReason
        }, returnLineInputKeyMap))).select("*");
        if(retourLignesError) {
            throw new InternalServerError(retourLignesError.message);
        }

        return { item: mapToType<ReturnPresenter>({
            ...data,
            retours_lignes: retourLignes
        }, returnPresenterKeyMap) };
    }
 
    private async getModelesWithDetails(modeleIds: number[]) {
        if(modeleIds === undefined || modeleIds === null || !Array.isArray(modeleIds) || modeleIds.length === 0) {
            throw new InternalServerError("La liste des modeles à rechercher est vide dans la fonction getModelesWithDetails");
        }
        const modelesRequest = this.supabase
            .from('modeles')
            .select('*, produits(id, prix_vente_ht, tva, produit_descriptions(titre, lang)), modele_attribut_valeurs(id_attribut_valeur,attribut_valeurs(nom))')
            .eq('produits.produit_descriptions.lang', 'fr');
        if(modeleIds !== undefined && modeleIds !== null && Array.isArray(modeleIds) && modeleIds.length > 0) {            
            modelesRequest.in('id', modeleIds);
        }
        const modeles = await modelesRequest;

        if(modeles.error) {
            throw new InternalServerError("Recupération des modeles: " + modeles.error.message + " | " + modeleIds + " ["+ Array.isArray(modeleIds) + "] >>> " + JSON.stringify(modeles, null, 2) + " >>> " + JSON.stringify(modelesRequest, null, 2));
        }

        const modelesMap = new Map<number, any>();
        const modelesImages = new Map<number, string>();
        
        for(const modele of modeles.data ?? []) {
            const productImageRequest = this.supabase
                .from('produit_images')
                .select('url')
                .eq('id_produit', modele.produits.id)
            if(modele.modele_attribut_valeurs.length > 0) {
                productImageRequest.in('id_attribut_valeur', modele.modele_attribut_valeurs.map((valeur: any) => valeur.id_attribut_valeur));
            }
            const productImage = await productImageRequest;
            let image = "";
            if(productImage.data?.length && productImage.data.length > 0) {
                image = productImage.data[0]?.url;
            }
            modelesImages.set(Number(modele.id), image);
            modelesMap.set(Number(modele.id), modele);
        }

        return { modelesMap, modelesImages };
    }

    private async getModelesAdmin(modeleIds: number[]) {
        const modelAdminRequest = this.supabase.from('modeles_admin')
            .select('code_barre, id_modele')
            .in('id_modele', modeleIds);
        const modelAdmin = await modelAdminRequest;
        
        if(modelAdmin.error) {
            throw new InternalServerError("Recupération des modeles admin: " + modelAdmin.error.message);
        }
        
        const modelesAdminMap = new Map<number, string>();
        for(const modele of modelAdmin.data ?? []) {
            modelesAdminMap.set(Number(modele.id_modele), modele.code_barre);
        }

        return modelesAdminMap;
    }

    private isCodeBarre(searchNumber: number): boolean {
        const searchString = searchNumber.toString();
        
        // Codes-barres EAN-13 (13 chiffres)
        if (/^\d{13}$/.test(searchString)) {
            return true;
        }
        
        // Codes-barres EAN-8 (8 chiffres)
        if (/^\d{8}$/.test(searchString)) {
            return true;
        }
        
        // Codes-barres UPC-A (12 chiffres)
        if (/^\d{12}$/.test(searchString)) {
            return true;
        }
        
        // Codes-barres UPC-E (6-8 chiffres)
        if (/^\d{6,8}$/.test(searchString)) {
            return true;
        }
        
        // Codes-barres Code 128 (variable, mais généralement 10-20 chiffres)
        if (/^\d{10,20}$/.test(searchString)) {
            return true;
        }
        
        return false;
    }

    private async getRetoursFromRetoursTable(searchAsNumber: number, startOffset: number, endOffset: number, sort?: string, ids?: number[], filters?: any) : Promise<ReturnAll<ReturnPresenter>> {
        const query = this.supabase.from('retours')
            .select('*, commandes:id_commande(*, commande_lignes(*, modeles(*, produits(id, prix_vente_ht, tva, produit_descriptions(titre, lang)), modele_attribut_valeurs(id_attribut_valeur,attribut_valeurs(nom)))), clients(*, clubs:id_club_adherent(*))), \
                retours_lignes(*)', 
                { count: 'exact' });
        if(ids && ids.length > 0) {
            query.in('id', ids);
        }
        if(searchAsNumber > 0) {
            query.or(`id_commande.eq.${searchAsNumber},numero_suivi.ilike.%${searchAsNumber}%, numero_prise_en_charge.ilike.%${searchAsNumber}%`);
        }

        // Apply filters first
        if (filters) {            
            filters.forEach((f: ActiveFilter) => {
                const filterKey = f.key as ReturnFilterType;
                if (returnFilter[filterKey]) {
                    returnFilter[filterKey](query, f);
                }
            });
        }

        const { data, error, count } = await query.range(startOffset, endOffset).order('id', { ascending: sort === 'asc' });
        if (error) {
            throw new InternalServerError(error.message);
        }

        const returnObject : ReturnPresenter[] = [];
        for(const item of data) {
            // ------------------------------------------------------------------------
            // Recupération des modeles à retourner
            if(!item.retours_lignes || item.retours_lignes.length === 0) {
                const jsonRetourLignes = {
                    ...item,
                    clients: {
                        ...item.commandes.clients,
                    },
                    retours_lignes: []
                };
                const returnPresenter = mapToType<ReturnPresenter>(jsonRetourLignes, returnPresenterKeyMap);                
                returnObject.push(returnPresenter);
            } else {
                const modelesIds = item.retours_lignes.map((line: any) => line.id_modele);
                if(modelesIds.length <= 0) {
                    throw new InternalServerError("Une ligne de retour doit avoir un modele " + JSON.stringify(item, null, 2));
                }
                const { modelesMap, modelesImages } = await this.getModelesWithDetails(modelesIds);
                
                const modelesAdminMap = await this.getModelesAdmin(modelesIds);
                
                // ------------------------------------------------------------------------
                // Recupération des modeles de remplacement
                const modelesEchangeIds = item.retours_lignes.map((line: any) => line.id_modele_echange ?? 0).filter((id: number) => id > 0);
                let modelesEchangeMap: Map<number, any> = new Map<number, any>();
                let modelesEchangeImages: Map<number, string> = new Map<number, string>();
                let modelesAdminEchangeMap: Map<number, string> = new Map<number, string>();
                if(modelesEchangeIds.length > 0) {
                    ({ modelesMap: modelesEchangeMap, modelesImages: modelesEchangeImages } = await this.getModelesWithDetails(modelesEchangeIds));  
                    modelesAdminEchangeMap = await this.getModelesAdmin(modelesEchangeIds);
                }
                
                const jsonRetourLignes = {
                    ...item,
                    clients: {
                        ...item.commandes.clients,
                    },
                    retours_lignes: item.retours_lignes.map((line: any) => {
                        return {
                            ...line,                            
                            modeles: {
                                titre: modelesMap.get(Number(line.id_modele)) ? modelesMap.get(Number(line.id_modele)).produits.produit_descriptions[0].titre : "",
                                attribut_valeurs: modelesMap.get(Number(line.id_modele)) ? modelesMap.get(Number(line.id_modele)).modele_attribut_valeurs.map((valeur: any) => valeur.attribut_valeurs.nom) : [],
                                prix_vente_ht: modelesMap.get(Number(line.id_modele))?.prix_vente_ht > 0 ? modelesMap.get(Number(line.id_modele))?.prix_vente_ht : modelesMap.get(Number(line.id_modele))?.produits.prix_vente_ht,
                                image: modelesImages.get(Number(line.id_modele)) ? `/api/assets/${modelesImages.get(Number(line.id_modele))}` : undefined,
                                code_barre: modelesAdminMap.get(Number(line.id_modele)) ?? ''                                
                            },
                            modeles_echange: modelesEchangeMap.size > 0 && modelesEchangeImages.size > 0 && modelesAdminEchangeMap.size > 0 ? {
                                titre: modelesEchangeMap.get(Number(line.id_modele_echange)) ? modelesEchangeMap.get(Number(line.id_modele_echange)).produits.produit_descriptions[0].titre : "",
                                attribut_valeurs: modelesEchangeMap.get(Number(line.id_modele_echange)) ? modelesEchangeMap.get(Number(line.id_modele_echange)).modele_attribut_valeurs.map((valeur: any) => valeur.attribut_valeurs.nom) : [],
                                prix_vente_ht: modelesEchangeMap.get(Number(line.id_modele_echange))?.prix_vente_ht > 0 ? modelesEchangeMap.get(Number(line.id_modele_echange))?.prix_vente_ht : modelesEchangeMap.get(Number(line.id_modele_echange))?.produits.prix_vente_ht,
                                image: modelesEchangeImages.get(Number(line.id_modele_echange)) ? `/api/assets/${modelesEchangeImages.get(Number(line.id_modele_echange))}` : undefined,
                                code_barre: modelesAdminEchangeMap.get(Number(line.id_modele_echange)) ?? ''
                            } : undefined
                        }
                    })
                };
                const returnPresenter = mapToType<ReturnPresenter>(jsonRetourLignes, returnPresenterKeyMap);
                returnObject.push(returnPresenter);
            }
        }

        return {
            items: returnObject,
            total: count ?? 0,
            count: returnObject.length,
        }
    }

    async listAllReturns(options: ReturnFilterInput): Promise<ReturnAll<ReturnPresenter>> {
        const { limit, offset, sort, search, filters } = options;
        const startOffset = (offset ?? 0) * (limit ?? Number.MAX_SAFE_INTEGER);
        const endOffset = startOffset + (limit ?? Number.MAX_SAFE_INTEGER) - 1;

        if(search && search !== '') {
            const searchAsNumber = Number(search);
            if(!isNaN(searchAsNumber) && !this.isCodeBarre(searchAsNumber)) {
                return this.getRetoursFromRetoursTable(searchAsNumber, startOffset, endOffset, sort, [], filters);
            } else if(!isNaN(searchAsNumber) && this.isCodeBarre(searchAsNumber)) {
                const modelAdminRequest = this.supabase.from('modeles_admin')
                    .select('code_barre, id_modele')
                    .eq('code_barre', searchAsNumber.toString());
                const modelAdmin = await modelAdminRequest;
                if(modelAdmin.data) {
                    const retourLignesRequest = this.supabase.from('retours_lignes')
                        .select('*')
                        .in('id_modele', modelAdmin.data.map((item: any) => item.id_modele));
                    const retourLignes = await retourLignesRequest;
                    if(retourLignes.data) {
                        return this.getRetoursFromRetoursTable(searchAsNumber, startOffset, endOffset, sort, retourLignes.data.map((item: any) => item.id_retour), filters);
                    } else {
                        return {
                            items: [],
                            total: 0,
                            count: 0,
                            error: "Aucun retour trouvé"
                        }
                    }
                } else {
                    return {
                        items: [],
                        total: 0,
                        count: 0,
                        error: "Aucun retour trouvé"
                    }
                }
            } else {
                const produitDescriptions = await this.supabase
                    .from('produit_descriptions')
                    .select(`titre, description, lang, produits(id)`)
                    .eq('produits.produit_descriptions.lang', 'fr')
                    .or(`titre.ilike.%${search}%, description.ilike.%${search}%`);
                if(!produitDescriptions.error && produitDescriptions.data) {
                    const produitIds = produitDescriptions.data.map((item: any) => item.id_produit);
                    const modeles = await this.supabase
                        .from('modeles')
                        .select('id, id_produit')
                        .in('id_produit', produitIds);
                    if(!modeles.error && modeles.data) {
                        const modelesIds = modeles.data.map((item: any) => item.id);
                        const retourLignesRequest = this.supabase.from('retours_lignes')
                            .select('*')
                            .in('id_modele', modelesIds);
                        const retourLignes = await retourLignesRequest;
                        if(retourLignes.data) {
                            return this.getRetoursFromRetoursTable(searchAsNumber, startOffset, endOffset, sort, retourLignes.data.map((item: any) => item.id_retour), filters);
                        } else {
                            return {
                                items: [],
                                total: 0,
                                count: 0,
                                error: "Aucun retour trouvé"
                            }
                        }
                    } else {
                        return {
                            items: [],
                            total: 0,
                            count: 0,
                            error: "Aucun retour trouvé"
                        }
                    }
                } else {
                    return {
                        items: [],
                        total: 0,
                        count: 0,
                        error: "Aucun retour trouvé"
                    }
                }
            }                
        }

        return this.getRetoursFromRetoursTable(0, startOffset, endOffset, sort, [], filters);
    }           
    
    async getReturn(id: number): Promise<ReturnOne<ReturnPresenter>> {
        const retours = await this.getRetoursFromRetoursTable(0, 0, 1, 'asc', [id]);
        if(retours.items.length === 0) {
            return {
                item: null as unknown as ReturnPresenter,
                error: "Aucun retour trouvé"
            }
        }
        if(retours.error) {
            return {
                item: null as unknown as ReturnPresenter,
                error: retours.error
            }
        }
        if(!retours.items[0]) {
            return {
                item: null as unknown as ReturnPresenter,
                error: "Aucun retour trouvé"
            }
        }

        const returnPresenter : ReturnPresenter = retours.items[0];
        return {
            item: returnPresenter,
        }
    }

    async updateReturn(id: number, returnData: ReturnPresenterInput): Promise<ReturnOne<ReturnPresenter>> {
        const { data : retour, error : updateError } = await this.supabase
            .from('retours')
            .update({
                id_commande: returnData.orderId,
                type_retour: returnData.type,   
                date_demande: returnData.requestDate,
                date_reception: returnData.commandReceptionDate,
                numero_suivi: returnData.trackingNumber,
                numero_prise_en_charge: returnData.supportNumber,
                cab_routage: returnData.routingDebitCard,
                date_commande_recu_le: returnData.commandReceptionDate,
                motif_retour: returnData.returnReason,                
                date_remboursement: returnData.repaymentDate,
                date_reexpedition: returnData.reexpeditionDate,
                etat: returnData.status
            })
            .eq('id', id)
            .select("*,\
                commandes:id_commande(clients(*, clubs:id_club_adherent(*))), \
                retours_lignes(*)")
            .single();

        if(updateError) {
            throw new InternalServerError(updateError.message);
        }

        const modelesIds = retour.retours_lignes.map((line: any) => line.id_modele);
        const { modelesMap, modelesImages } = await this.getModelesWithDetails(modelesIds);
        const modelesAdminMap = await this.getModelesAdmin(modelesIds);

        const returnPresenter = mapToType<ReturnPresenter>({
            ...retour,
            retours_lignes: retour.retours_lignes.map((line: any) => {
                return {
                    ...line,
                    modeles: {
                        ...modelesMap.get(Number(line.id_modele)),
                        image: modelesImages.get(Number(line.id_modele)) ? `/api/assets/${modelesImages.get(Number(line.id_modele))}` : undefined,
                        code_barre: modelesAdminMap.get(Number(line.id_modele)) ?? ''
                    },
                    modeles_echange: line.id_modele_echange ?? {
                        ...modelesMap.get(Number(line.id_modele_echange)),
                        image: modelesImages.get(Number(line.id_modele_echange)) ? `/api/assets/${modelesImages.get(Number(line.id_modele_echange))}` : undefined,
                        code_barre: modelesAdminMap.get(Number(line.id_modele_echange)) ?? ''
                    }
                }
            })
        }, returnPresenterKeyMap);
        return {
            item: returnPresenter,
        }
    }
}