import { registerFunction } from "../_shared/index.ts";

registerFunction(async ({ req, userClient, user}) => {
    const origin = req.headers.get('Origin');    

    if(!origin) {
        return { success: false, error: { message: `Invalid origin ${origin}`} };
    }

    const promo = await userClient.from('avoirs').select('*, commandes!inner(numero_client)')
        .eq('user_id', user.id)
        .eq('used', false);

    if(promo.error) {
        return { success: false, error: promo.error };
    }

    const montant_commande = promo.data.reduce((acc, p) => acc + p.montant, 0);

    return { 
        success: true, 
        data: { 
            montant_commande
        }    
    };
});