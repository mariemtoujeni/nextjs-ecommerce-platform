import { ICreditNoteRepository, ReadCreditNoteProps } from "../../repositories";
import { CreditNote, CreditNoteInput, CreditNoteLine, Order } from "../../models";
import { ReturnAll, ReturnOne } from "../../types/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { KeyMap, mapToType, mapFromType } from "./MapToType";
import { orderKeyMap } from "./ClientRepository";
import { InternalServerError, NotFoundError } from "../../types/error";

export const creditNoteLineKeyMap: KeyMap<CreditNoteLine> = {
    creditNoteId: "id_avoir",
    modelId: "id_modele",
    quantity: "quantite",
    priceExcludingTax: "prix_achat_ht",
    vatRate: "tva",
    label: "intitule"
}

export const creditNoteKeyMap: KeyMap<CreditNote> = {
    id: "id",
    clientId: "numero_client",
    orderId: "id_commande",
    order: {
        key: "commandes",
        transform: (value) => mapToType<Order>(value, orderKeyMap)
    },
    total: "total",
    createdAt: "date_creation",
    expiredAt: "date_expiration",
    used: "utilise",
    type: "type",
    remainingAmount: "montant_restant",
    lines: {
        key: "avoirs_lignes",
        transform: (value) => Array.isArray(value) ? value.map((v) => mapToType<CreditNoteLine>(v, creditNoteLineKeyMap)) : []
    }
}

export class CreditNoteRepository implements ICreditNoteRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
    async update(id: number, montant_restant: number, utilise: boolean): Promise<CreditNote>{
        const { data, error } = await this.supabase.from('avoirs').update({
            montant_restant: montant_restant,
            utilise: utilise,
        }).eq('id',id).select().maybeSingle();
        if (error) throw new InternalServerError(error.message);

        return mapToType<CreditNote>(data, creditNoteKeyMap);
    }

    async readUnused(clientNumber: number): Promise<CreditNote[]> {
       const {data , error} = await this.supabase.from('avoirs')
            .select('*')
            .eq('utilise', false)
            .eq('numero_client', clientNumber)
            .order('id', { ascending: true });

        return data ? data.map(stock => mapToType<CreditNote>(stock, creditNoteKeyMap)) : []
    }

    async read(clientNumber: number): Promise<CreditNote[]> {
           const { data, error } = await this.supabase.from('avoirs')
               .select('*')
               .eq("numero_client", clientNumber);
           if (error) {
               throw new NotFoundError(error.message);
           }
   
           return data.map(creditNotes => mapToType<CreditNote>(creditNotes, creditNoteKeyMap))
       }

    async readAll(props: ReadCreditNoteProps): Promise<ReturnAll<CreditNote>> {
        const creditNotesReq = this.supabase
            .from('avoirs')
            .select('*, commandes!inner(*, clients!inner(*, clubs!id_club(*))), avoirs_lignes(*)', { count: 'exact' });

        if (props.clientNumber) {
            creditNotesReq.eq('numero_client', props.clientNumber);
        }
        if (props.orderNumbers) {
            creditNotesReq.in('id_commande', props.orderNumbers);
        }
        if (props.startDate && props.endDate) {
            creditNotesReq.gte('date_creation', props.startDate.toISOString());
            creditNotesReq.lte('date_creation', props.endDate.toISOString());
        }

        const { data, error, count : totalCount } = await creditNotesReq;

        if (error) {
            throw new InternalServerError(error.message);
        }

        const creditNotes : CreditNote[] = data.map((creditNote: any) => mapToType<CreditNote>(creditNote, creditNoteKeyMap));

        return { items: creditNotes, total: totalCount || 0, count: creditNotes.length || 0 };
    }

    async create(creditNoteInput: CreditNoteInput): Promise<ReturnOne<CreditNote>> {
        const { data, error } = await this.supabase.from('avoirs').insert(mapFromType<CreditNoteInput>(creditNoteInput, creditNoteKeyMap)).select().single();

        if (error) {
            throw new InternalServerError(error.message);
        }

        return { item: mapToType<CreditNote>(data, creditNoteKeyMap), error: undefined };
    }
}