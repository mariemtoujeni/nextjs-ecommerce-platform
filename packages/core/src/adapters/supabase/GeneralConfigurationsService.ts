import { SupabaseClient } from "@supabase/supabase-js";
import { Settings } from "../../models/GeneralConfigurations";
import { IGeneralConfigurationsRepository } from "../../repositories/IGeneralConfigurationsRepository";

export class GeneralConfigurationsService implements IGeneralConfigurationsRepository {
    private supabase: SupabaseClient;
    
    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }
    
    async read(): Promise<Settings> {
        const { data, error } = await this.supabase.from('configurations_generales').select('*').order('date_creation', {ascending: false}).single();

        if(error) {
            throw new Error(error.message);
        }

        const generalConf : Settings = {
            duree_validite_cheque_cadeau: data.duree_validite_cheque_cadeau,
            type_duree_validite_cheque_cadeau: data.type_duree_validite_cheque_cadeau,
            duree_validite_avoir: data.duree_validite_avoir,
            type_duree_validitee_avoir: data.type_duree_validitee_avoir,
            duree_validite_email_relance: data.duree_validite_email_relance,
            type_duree_validite_email_relance: data.type_duree_validite_email_relance,
            duree_validite_cashback: data.duree_validite_cashback,
            type_duree_validite_cashback: data.type_duree_validite_cashback,
            reduction_cashback: data.reduction_cashback
        };
        return generalConf;
    }

    async update(request: Settings): Promise<Settings> {
        const { data, error } = await this.supabase.from('configurations_generales')
            .update(request).eq('id', 1).single();

        if(error) {
            throw new Error(error.message);
        }
        
        return request;
    }
}