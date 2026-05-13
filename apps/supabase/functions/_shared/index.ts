import { SupabaseClient, createClient } from "jsr:@supabase/supabase-js@2";

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
}

export enum ErrorCodes {
    CLIENT_INEXISTANT = 'CLIENT_INEXISTANT',
    UTILISATEUR_NON_CONNECTE = 'UTILISATEUR_NON_CONNECTE',
    STOCK_INSUFFISANT = 'STOCK_INSUFFISANT',
    MODELE_INEXISTANT = 'MODELE_INEXISTANT',
    PANIER_INEXISTANT = 'PANIER_INEXISTANT',
    MAJ_PANIER_IMPOSSIBLE = 'MAJ_PANIER_IMPOSSIBLE',
    AUCUNE_ZONE_DE_LIVRAISON = 'AUCUNE_ZONE_DE_LIVRAISON',
    MAJ_PANIER_REDUCTIONS_IMPOSSIBLE = 'MAJ_PANIER_REDUCTIONS_IMPOSSIBLE',
    EMAIL_IMPOSSIBLE = 'EMAIL_IMPOSSIBLE',
    NEWSLETTER_INSCRIPTION_FAILED = 'NEWSLETTER_INSCRIPTION_FAILED',
    UPDATE_USER_ERROR = 'UPDATE_USER_ERROR',
}

export type AppliedReduction = {
    total_reductions: number;
    reductions: any[];
}

export enum Environment {
    TEST = 'TEST',
    PROD = 'PROD'
}

const prodEnvs = ['nataquashop.com', 'swimwear-destock.com', 'crazyswim.com']

export const wichEnv = (origin: string) => prodEnvs.includes(origin) ? Environment.PROD : Environment.TEST

export type BodyResponse = {
    message?: string;
    success: boolean;
    code?: ErrorCodes;
    // deno-lint-ignore no-explicit-any
    error?: any;
    // deno-lint-ignore no-explicit-any
    data?: any;
}

type FunctionType = {
    req: Request;
    userClient: SupabaseClient;
    adminClient: SupabaseClient;
    // deno-lint-ignore no-explicit-any
    user: any
}
type Options ={
    disableAuth?: boolean;
    allowOnlyAdmin?: boolean;
}


export const isAdministator = async (adminClient: SupabaseClient, user: any) => {
    const permission = await adminClient.from('permissions').select('*').eq('id', user.id).single();
    if(permission.error) {
        return false;
    }
    return (permission.data.role === 'admin')
}

export const registerFunction = (callback: (ft: FunctionType) => Promise<BodyResponse>, options: Options = {}) => {
    return Deno.serve(async (req) => {
        let response: BodyResponse | undefined = { success: true };
        
        try {
            const auth = req.headers.get('Authorization');
            
            if (req.method === 'OPTIONS' ||  "" === auth || !auth) {
                console.warn('No auth header or OPTIONS used')
                return new Response(JSON.stringify(response), { headers: { ...corsHeaders }, status: 200 })
            }

            const client = createClient(
                Deno.env.get('SUPABASE_URL')!
                , Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
                , { global: { headers: { Authorization: auth } } }
            );

            const supabase = createClient(
                Deno.env.get('SUPABASE_URL')!
                , Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            );

            let user = {};

            if(options.allowOnlyAdmin) {
                const getUser = await client.auth.getUser();
                if(getUser.error || !getUser.data.user) {
                    response.success = false;
                    response.code = ErrorCodes.UTILISATEUR_NON_CONNECTE;
                    response.error = getUser.error || undefined;

                    return new Response(JSON.stringify(response), { headers: { ...corsHeaders }, status: 400 })
                }
                user = getUser.data.user;
                if(!isAdministator(supabase, user)) {
                    response.success = false;
                    response.code = ErrorCodes.UTILISATEUR_NON_CONNECTE;
                    response.error = { message: 'User does not have admin rights' };

                    return new Response(JSON.stringify(response), { headers: { ...corsHeaders }, status: 400 })
                }
            }
            if(!options.disableAuth) {
                const getUser = await client.auth.getUser();

                if(getUser.error || !getUser.data.user) {
                    response.success = false;
                    response.code = ErrorCodes.UTILISATEUR_NON_CONNECTE;
                    response.error = getUser.error || undefined;

                    return new Response(JSON.stringify(response), { headers: { ...corsHeaders }, status: 400 })
                }
                user = getUser.data.user
            }

            response = await callback({ req, userClient: client, adminClient: supabase, user });
        } catch (error) {
            console.error(JSON.stringify(error));
            response = { success: false, error: { message: `${error.name} : ${error.message}` } };
        }

        return new Response( JSON.stringify(response)
            , { headers: { ...corsHeaders }, status: 200 })
    })
}

export const SystemPayPassword = {
    "TEST":  "testpassword_aNwtmkWrDoqvZZiiELV3QhkzV56tjrj82WQL7ZprdKEii",
    "PROD": ""
}

export enum DeliveryMode {
    NON_LIVRABLE= "NON_LIVRABLE",
    MANUEL= "MANUEL",
    EXPEDITOR= "EXPEDITOR",
    MONDIAL_RELAY= "MONDIAL_RELAIS",
    EXAPAQ= "EXAPAQ",
    ICI_RELAIS= "ICI_RELAIS",
    CHRONOPOST= "CHRONOPOST",
    CHRONOPOST_RELAIS= "CHRONOPOST_RELAIS",
    AU_MAGASIN= "AU_MAGASIN",
    AU_CLUB= "AU_CLUB",
    SO_COLISSIMO= "SO_COLISSIMO",
    COLISSIMO= "COLISSIMO",
}

export enum CommandeStatut {
    ATTENTE_ACCEPTATION_DEVIS= 'ATTENTE_ACCEPTATION_DEVIS', 
    ATTENTE_PAIEMENT= 'ATTENTE_PAIEMENT', 
    PAIEMENT_ACCEPTE= 'PAIEMENT_ACCEPTE', 
    PREPARATION= 'PREPARATION', 
    EXPEDIEE_PARTIELLEMENT= 'EXPEDIEE_PARTIELLEMENT', 
    EXPEDIEE= 'EXPEDIEE', 
    DEVIS_ARCHIVE= 'DEVIS_ARCHIVE'
}

export const computeFidelityDiscount = (pointsFidelity: number) => {
    // Calculate fidelity discount using logaritmic function based on
    //- value coefficient (the rate at which the value in euros increases based on the number of points) 
    //- Maximum tangent (the furthest point on the curve that can be approached, but never fully reached, as the number of points gained decreases with the accumulation of points)
    const valueCoefficient = 2;
    const maximumTangent = 1000;
    const discount = Math.log(pointsFidelity + 1) * valueCoefficient;
    const discountInEuros = Math.min(discount, maximumTangent);

    return discountInEuros;
}

export type CreateAdminAlert = {
    fonction: string;
    message: string;
    // deno-lint-ignore no-explicit-any
    metadata?: any;
}

export const createAdminAlert = async (adminClient: SupabaseClient, data: CreateAdminAlert) => {
    console.error(`${data.fonction} : ${data.message}`);
    return await adminClient.from('admin_alertes').insert({
        date: new Date().toISOString(), ...data });
}