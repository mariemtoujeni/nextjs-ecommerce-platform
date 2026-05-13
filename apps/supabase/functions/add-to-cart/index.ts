// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { BodyResponse, ErrorCodes, registerFunction } from "../_shared/index.ts"
import { bestAutoReduction } from "../_shared/ReductionFunctions.ts";

type Body = {
    id_modele: string | number;
    quantite: number;
    action: 'add' | 'increment' | 'decrement' | 'edit'
    personnalisation?: string;
    text?: string;
    prix?: number;
}

registerFunction(async ({ req, userClient, adminClient, user}) => {

    const response: BodyResponse = { success: true };    

    const userId = user.id;

    const body: Body = await req.json();
    let clientType = 'CLIENT';
    const client = await userClient.from('clients').select('*').eq('id_user', userId).single();
    if(client.data) {
        clientType = client.data.type;
    }

    const modeleIds = typeof body.id_modele === "string" ?  body.id_modele.split('_') : [body.id_modele];

    const modelePanierArray = await userClient.from('paniers').select('*')
        .eq('id_user', userId)
        .in('id_modele', modeleIds);

    if(modelePanierArray.error) {
        response.success = false;
        response.code = ErrorCodes.PANIER_INEXISTANT;
        response.error = modelePanierArray.error;
        return response;
    }

    for(const idModel of modeleIds) {
        // La récupération de la liste des modeles avec 'in' ne permet pas de récupérer les tables associées
        const modele = await adminClient.from('modeles')
            .select('*, stocks(*)')
            .eq('id', idModel).single();
        
        if(modele.error || !modele.data) {
            console.error(`Modele inexistant ${idModel}`, modele.error);
            continue;
        }
        
        const { stock_min, id, stocks: { disponible, indisponible } } = modele.data;
        const modelePanier = modelePanierArray.data.find((mp: any) => mp.id_modele === id);
        const quantitePanier = modelePanier? modelePanier.quantite : 0;
        let newStock = 0;
        let newDisponible = disponible;
        let newIndisponible = indisponible;
        let newQuantitePanier = quantitePanier;
        
        switch(body.action) {
            case 'increment':                
                if( clientType === 'CLIENT')  {
                    newStock = disponible - indisponible - quantitePanier - 1;
                    if(newStock < stock_min) {
                        response.success = false;
                        response.code = ErrorCodes.STOCK_INSUFFISANT;
                    }
                    else {
                        newDisponible = disponible - 1;
                        newIndisponible = indisponible + 1;
                        newQuantitePanier = quantitePanier + 1;
                    }   
                }   else { // Si c'est un commande club ou club partenaires il ne faut pas changer le stock puisqu'il passe en devis
                    newQuantitePanier = quantitePanier + 1;
                }
            break;
            case 'decrement':
                if(clientType === 'CLIENT')  {
                    newStock = disponible - indisponible + quantitePanier + 1;
                    if(newStock < stock_min) {
                        response.success = false;
                        response.code = ErrorCodes.STOCK_INSUFFISANT;
                    }
                    else {
                        newDisponible = disponible + 1;
                        newIndisponible = indisponible - 1;
                        newQuantitePanier = quantitePanier - 1;
                    }
                } else { // Si c'est un commande club ou club partenaires il ne faut pas changer le stock puisqu'il passe en devis
                    newQuantitePanier = quantitePanier - 1;
                }
            break;

            case 'edit':                
                if(clientType === 'CLIENT')  {
                    newStock = disponible - indisponible - body.quantite;
                    if(newStock < stock_min) {
                        response.success = false;
                        response.code = ErrorCodes.STOCK_INSUFFISANT;
                    }
                    else {
                        newDisponible = disponible - body.quantite + quantitePanier;
                        newIndisponible = indisponible + body.quantite - quantitePanier;
                        newQuantitePanier = body.quantite;
                    }
                } else { // Si c'est un commande club ou club partenaires il ne faut pas changer le stock puisqu'il passe en devis
                    newQuantitePanier = body.quantite;
                }
            break;

            case 'add':
            {
                if( clientType === 'CLIENT') {
                    newStock = disponible - indisponible - body.quantite + quantitePanier;
                    if(newStock < stock_min) {
                        response.success = false;
                        response.code = ErrorCodes.STOCK_INSUFFISANT;
                    } else {
                        newDisponible = disponible - body.quantite;
                        newIndisponible = indisponible + body.quantite;
                        newQuantitePanier = body.quantite + quantitePanier;
                    }   
                } else { // Si c'est un commande club ou club partenaires il ne faut pas changer le stock puisqu'il passe en devis
                    newQuantitePanier = body.quantite + quantitePanier;
                }
            }
            break;

            default:
                throw new Error('Action non reconnue');
        }

        console.log('new ', newQuantitePanier, newDisponible, newIndisponible);

        if(response.success) {
            // Si c'est un commande club ou club partenaires il ne faut pas changer le stock puisqu'il passe en devis
            let updateStock = null;
            if( clientType === 'CLIENT' ) {
                updateStock = await adminClient.from('stocks')
                    .update({ disponible: newDisponible, indisponible: newIndisponible })
                    .eq('id_modele', id);
            }
                
            if(0 < newQuantitePanier) {
                // ne pas chercher de réduction automartique si le client n'est pas connecté
                // deno-lint-ignore no-explicit-any
                let bestProductPromo: any = null;
                if(client.data) {
                    bestProductPromo = await bestAutoReduction(adminClient, modele, client.data, newQuantitePanier);  
                }

                const { error } = await adminClient.from('paniers').upsert({
                    id_modele: id,
                    id_user: userId,
                    quantite: newQuantitePanier, 
                    expedition : newDisponible >= 0 ? '24h' : '10j',
                    personnalisation: (body.personnalisation && body.personnalisation === "yes") || false,
                    text: (body.personnalisation && body.personnalisation === "yes") ? body.text : '',
                    prix: (body.personnalisation && body.personnalisation === "yes") ? body.prix : 0,
                    type_reduction: bestProductPromo ? bestProductPromo.type_reduction : null,
                    type_valeur_reduction: bestProductPromo ? bestProductPromo.type_valeur_reduction : null,
                    valeur_reduction: bestProductPromo ? bestProductPromo.valeur_reduction : null,
                    info_reduction: bestProductPromo ? bestProductPromo.info_reduction : null
                });

                if((updateStock && updateStock.error) || error) {
                    response.success = false;
                    response.code = ErrorCodes.MAJ_PANIER_IMPOSSIBLE;
                    response.error = updateStock?.error || error || {};
                }
                
            } else {
                const { error } = await adminClient.from('paniers').delete()
                    .eq('id_modele', id)
                    .eq('id_user', userId);

                if(( updateStock && updateStock.error ) || error) {
                    response.success = false;
                    response.code = ErrorCodes.MAJ_PANIER_IMPOSSIBLE;
                    response.error = updateStock?.error || error || {};
                } else {
                    // suppression des réductions du panier
                    const { error } = await adminClient.from('panier_reductions').delete()
                        .eq('id_modele', body.id_modele)
                        .eq('id_user', userId);

                    if(error) {
                        response.success = false;
                        response.code = ErrorCodes.MAJ_PANIER_REDUCTIONS_IMPOSSIBLE;
                        response.error = error;
                    }
                }
            }
        }
    }

    return response;
})

