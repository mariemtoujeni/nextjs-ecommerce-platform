import { registerFunction } from "../_shared/index.ts";

registerFunction(async ({ req, userClient }) => {
    const origin = req.headers.get('Origin');

    if(!origin) {
        return { success: false, error: { message: `Invalid origin ${origin}`} };
    }

    let body: any;
    const contentType = req.headers.get('Content-Type');
    if(contentType && contentType.includes('application/json')) {
        body = await req.json();
    } else {
        body = await req.formData();
    }

    let montant_commande = 0;    
    if(body.montant_commande)   {
        montant_commande = body.montant_commande;
    }

    let nbr_articles = 0;
    if(body.nbr_articles)   {
        nbr_articles = body.nbr_articles;
    }

    let reductionPromo = 0;
    if(body.codePromo)  {
        const promo = await userClient.from('reductions').select('*')
            .eq('code', body.codePromo)            
            .eq('etat', 'ACTIVE')
            .single();
        if(promo.error) {
            return { success: false, error: promo.error };
        }

        if(promo.data && promo.data.type_condition_achat_min === 'MONTANT' && promo.data.valeur_condition_achat_min >= montant_commande) {
            if(promo.data.type_valeur === 'MONTANT') {
                reductionPromo = promo.data.valeur;
            } else if(promo.data.type_valeur === 'POURCENTAGE') {
                reductionPromo = promo.data.valeur * montant_commande / 100;
            }
        }   else if(promo.data && promo.data.type_condition_achat_min === 'QUANTITE_PRODUIT' && promo.data.valeur_condition_achat_min >= nbr_articles) {
            if(promo.data.type_valeur === 'MONTANT') {
                reductionPromo = promo.data.valeur;
            }   else if(promo.data.type_valeur === 'POURCENTAGE') {
                reductionPromo = promo.data.valeur * montant_commande / 100;
            }
        }
    }

    return { success: true, data: { 
        percentage: reductionPromo / montant_commande * 100,
        value: reductionPromo 
    } };
});