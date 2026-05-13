import { Quotation, QuotationDiscount, QuotationDiscountInput, 
         QuotationFilter, QuotationFilterTypeAdmin, QuotationInput, QuotationLine, QuotationLineInput, QuotationStatus } from "../../models/Quotation";
import { Client } from "../../models/Client";
import { Club } from "../../models/Club";
import { ModelWithProductDetail } from "../../models/ProductAlert";
import { ActiveFilter, ReturnAll } from "../../types/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { InternalServerError, NotFoundError } from "../../types/error";
import { KeyMap, mapToType } from "./MapToType";
import { IQuotationRepository } from "../../repositories/IQuotationRepository";
import { clientKeyMap, clubKeyMap } from "./ClientRepository";
import { modelWithProductDetailKeyMap } from "./ProductAlertRepository";

export const quotationKeyMap: KeyMap<Quotation> = {
    id: 'id',
    title: 'intitule',
    shippingFees: 'frais_port',
    rest: 'reste',
    withoutTVA: 'sans_tva',
    totalDiscount: 'total_reductions',
    clientComment: 'commentaire_client',
    usedCredit: 'credit_utilise',
    version: 'version',
    deliveryMode: 'mode_livraison',
    createdAt: 'date_creation',
    orderId: 'id_commande',
    clubId: 'id_club',
    club: {
        key: 'clubs',
        transform: (value) => mapToType<Club>(value, clubKeyMap)
    },
    clientNumber: 'numero_client',
    status: {
        key: 'statut',
        transform: (value) => value as QuotationStatus
    },
    totalAmount: 'montant_total',
    client:  {
        key: 'clients',
        transform: (value) => mapToType<Client>(value, clientKeyMap),
    },
    order: {
        key: 'commandes',
        transform: (value) => mapToType<Client>(value, clientKeyMap),
    },
};

export const quotationLineKeyMap: KeyMap<QuotationLine> = {
    id: 'id',
    quantity: 'quantite',
    unitPriceExcludingTax: 'prix_unitaire_ht',
    tva: 'tva',
    totalPriceExcludingTax: 'prix_total_ht',
    totalPriceIncludingTax: 'prix_total_ttc',
    giftVoucher: 'cheque_cadeau',
    checkDuration: 'cheque_duree',
    weight: 'poids',
    available: 'disponible',
    createdAt: 'date_creation',
    quotationId: 'id_devis',
    modelId: 'id_modele',
    discountType: 'type_reduction',
    discountValueType: 'type_valeur_reduction',
    barcode: 'code_barre',
    manufacturerReference: 'reference_fabricant',
    comment: 'commentaire',
    discountValue: 'valeur_reduction',
    discountInfo: 'info_reduction',
    modelProduct: {
        key: 'modeles',
        transform: (value) => mapToType<ModelWithProductDetail>(value, modelWithProductDetailKeyMap),
    },
}

export const quotationDiscountKeyMap: KeyMap<QuotationDiscount> = {
    id: 'id',
    quotationId: 'id_devis',
    valueType: 'type_valeur',
    discountId: 'id_reduction',
    value: 'valeur',
    info: 'info',
    date: 'date',
    type: 'type',
}

type FilterMappginFunction = (baseQuery: any, filter: ActiveFilter) => any;
export const quotationFilter: Record<QuotationFilterTypeAdmin, FilterMappginFunction> = {
    [QuotationFilterTypeAdmin.STATE]: (baseQuery, filter) => {
        const values = filter.values as string[];
        return baseQuery.in('statut', values);
    }
};

export class QuotationRepository implements IQuotationRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async deleteQuotationLine(id: number): Promise<void> {
        const { error } = await this.supabase.from('devis_lignes').delete().eq('id', id);
        if (error) throw new InternalServerError(error.message);
    }

    async updateQuotationLine(quotationLine: QuotationLine): Promise<QuotationLine> {
        const { data, error } = await this.supabase.from('devis_lignes').update({
            quantite: quotationLine.quantity,
            valeur_reduction: quotationLine.discountValue,
            type_valeur_reduction: quotationLine.discountValueType
        }).eq('id', quotationLine.id).select().maybeSingle();
        if (error) throw new InternalServerError(error.message);

        return mapToType<QuotationLine>(data, quotationLineKeyMap);
    }

    async updateQuotationDiscount(quotationDiscount: QuotationDiscount): Promise<QuotationDiscount> {
        const { data, error } = await this.supabase.from('devis_reductions').update({
            type_valeur: quotationDiscount.valueType,
            valeur: quotationDiscount.value,
            info: quotationDiscount.info,
            type: quotationDiscount.type,
        }).eq('id', quotationDiscount.id).select().maybeSingle();
        if (error) throw new InternalServerError(error.message);

        return mapToType<QuotationDiscount>(data, quotationDiscountKeyMap);
    }

    async addQuotationDiscount(quotationDiscount: QuotationDiscountInput): Promise<QuotationDiscount> {
        const { data, error } = await this.supabase.from('devis_reductions').insert({
            id_devis: quotationDiscount.quotationId,
            type_valeur: quotationDiscount.valueType,
            //id_reduction: quotationDiscount.discountId,
            valeur: quotationDiscount.value,
            info: quotationDiscount.info,
            type: quotationDiscount.type,
        }).select("*").single();
        if (error) throw new InternalServerError(error.message);
        return mapToType<QuotationDiscount>(data, quotationDiscountKeyMap);
    }

    async deleteQuotationDiscount(id: number): Promise<void> {
        const { error } = await this.supabase.from('devis_reductions').delete().eq('id', id);
        if (error) throw new InternalServerError(error.message);
    }

    async findQuotationDiscountsByQuotationId(quotationId: number): Promise<ReturnAll<QuotationDiscount>> {
        const quotationDiscounts = await this.supabase.from('devis_reductions')
        .select('*', { count: 'exact' })
        .order('id', { ascending: true })
        .eq('id_devis', quotationId)

        if (quotationDiscounts.error) throw new NotFoundError(quotationDiscounts.error.message);

        return {
        items: quotationDiscounts?.data ? quotationDiscounts.data.map(quotationDiscount => mapToType<QuotationDiscount>(quotationDiscount, quotationDiscountKeyMap)) : [],
        total: quotationDiscounts?.count ?? 0,
        count: quotationDiscounts?.data ? quotationDiscounts.data.length : 0,
        };
    }

    async findQuotationLinesByQuotationId(quotationId: number): Promise<ReturnAll<QuotationLine>> {
        const quotationLines = await this.supabase.from('devis_lignes')
        .select('*, modeles (*, produits ( produit_descriptions(*), produit_images(*) ))', { count: 'exact' })
        .order('id', { ascending: true })
        .eq('id_devis', quotationId)

        if (quotationLines.error) throw new NotFoundError(quotationLines.error.message);

        return {
        items: quotationLines?.data ? quotationLines.data.map(quotationLine => mapToType<QuotationLine>(quotationLine, quotationLineKeyMap)) : [],
        total: quotationLines?.count ?? 0,
        count: quotationLines?.data ? quotationLines.data.length : 0,
        };
    }


    async addQuotationLine(quotationLine: QuotationLineInput): Promise<QuotationLine> {
        const { data, error } = await this.supabase.from('devis_lignes').insert({
            id_devis: quotationLine.quotationId,
            id_modele: quotationLine.modelId,
            quantite: quotationLine.quantity,
            type_reduction: quotationLine.discountType,
            type_valeur_reduction: quotationLine.discountValueType,
            code_barre: quotationLine.barcode,
            reference_fabricant: quotationLine.manufacturerReference,
            prix_unitaire_ht: quotationLine.unitPriceExcludingTax,
            prix_total_ht: quotationLine.totalPriceExcludingTax,
            tva: quotationLine.tva,
            prix_total_ttc: quotationLine.totalPriceIncludingTax,
            cheque_cadeau: quotationLine.giftVoucher,
            cheque_duree: quotationLine.checkDuration,
            commentaire: quotationLine.comment,
            valeur_reduction: quotationLine.discountValue,
            info_reduction: quotationLine.discountInfo,
            disponible: quotationLine.available,
            poids: quotationLine.weight,
        }).select("*").single();
        if (error) throw new InternalServerError(error.message);
        return mapToType<QuotationLine>(data, quotationLineKeyMap);
    }
    
    async updateQuotation(quotation: Quotation): Promise<Quotation> {
        const { data, error } = await this.supabase.from('devis').update({
            intitule: quotation.title,
            frais_port: quotation.shippingFees,
            reste: quotation.rest,
            sans_tva: quotation.withoutTVA,
            total_reductions: quotation.totalDiscount,
            commentaire_client: quotation.clientComment,
            credit_utilise: quotation.usedCredit,
            version: quotation.version,
            mode_livraison: quotation.deliveryMode,
            id_club: quotation.clubId,
            numero_client: quotation.clientNumber,
            statut: quotation.status,
            montant_total: quotation.totalAmount,
        }).eq('id', quotation.id).select().maybeSingle();
        if (error) throw new InternalServerError(error.message);

        return mapToType<Quotation>(data, quotationKeyMap);
    }

    async addQuotation(quotation: QuotationInput): Promise<Quotation> {
        const { data, error } = await this.supabase.from('devis').insert({
            intitule: quotation.title,
            frais_port: quotation.shippingFees,
            sans_tva: quotation.withoutTVA,
            total_reductions: quotation.totalDiscount ? quotation.totalDiscount.toString() : '0',
            commentaire_client: quotation.clientComment,
            credit_utilise: quotation.usedCredit,
            version: quotation.version,
            statut: quotation.status,
            montant_total: quotation.totalAmount,
        }).select("*").single();
        if (error) throw new InternalServerError(error.message);
        return mapToType<Quotation>(data, quotationKeyMap);
    }

    async readById(id: number): Promise<Quotation> {
        const { data, error } = await this.supabase.from('devis').select('*, clubs(*)').eq('id', id).single();
        if (error) throw new Error(`find by Id failed: ${error.message}`);

        return mapToType<Quotation>(data, quotationKeyMap);
    }

    async read(options: QuotationFilter): Promise<ReturnAll<Quotation>> {
        const startOffset = options.offset * options.limit;
        const endOffset = startOffset + options.limit - 1;

        let query = this.supabase
            .from('devis')
            .select('*, clubs(*), commandes(*), clients(*)', { count: 'exact' })    
            .order('id', { ascending: options.sort === 'asc' });

        if (options.search) {
            const searchAsNumber = parseInt(options.search);

            if (!isNaN(searchAsNumber)) {
                query.eq('id', searchAsNumber);
            } else {
                query.ilike('produit_descriptions.titre', `%${options.search}%`);
            }
        }

        if (options.filters) {
            options.filters.forEach(filter => quotationFilter[filter.key as QuotationFilterTypeAdmin](query, filter));
        }

        query = query.not('id_club', 'is', null);

        query = query.range(startOffset, endOffset)

        const quotations = await query;

        if (quotations.error) {
            throw new NotFoundError(quotations.error.message);
        }
        
        return {
            items: quotations?.data ? quotations.data.map(quotation => mapToType<Quotation>(quotation, quotationKeyMap)) : [],
            total: quotations?.count ?? 0,
            count: quotations?.data ? quotations.data.length : 0,
        };

    }

}