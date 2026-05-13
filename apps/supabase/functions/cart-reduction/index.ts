import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { BodyResponse, ErrorCodes, registerFunction } from "../_shared/index.ts"
import { bestAutoReduction } from "../_shared/ReductionFunctions.ts";


type Body = {
    type: "code_promo" | "avoir" | "cheque_cadeau" | "supprimer";
    valeur: string | number;
}

registerFunction(async ({ req, userClient, adminClient, user}) => {

    const response: BodyResponse = { success: true };    

    const userId = user.id;

    const body: Body = await req.json();
    const client = await userClient.from('clients').select('*').eq('id_user', userId).single();
    if(client.error) {
        response.success = false;
        response.code = ErrorCodes.CLIENT_INEXISTANT;
        response.error = client.error;
        return response;
    }
    const paniers = await userClient.from('paniers').select('*, modeles(*)').eq('id_user', userId);
    const montantPanier = paniers.data 
        ?  paniers.data.reduce((acc: number, panier: any) => acc + panier.modeles.prix_vente_ttc*panier.quantite, 0)
        : 0;

    if("supprimer" === body.type) {
        await adminClient.from('panier_reduction').delete().eq('id_user', userId);
    } else if("code_promo" === body.type) {
        const modelePanierArray = await userClient.from('paniers').select('*')
            .eq('id_user', userId);
        if(modelePanierArray.error) {
            throw new Error('Impossible de récupérer les paniers');
        }

        for(const modelePanier of modelePanierArray.data) {
            const modele = await adminClient.from('modeles')
                .select('*')
                .eq('id', modelePanier.id_modele)
                .single();
            if(modele.error || !modele.data) {
                throw new Error('Impossible de récupérer les paniers');
            }

            const quantitePanier = modelePanier? modelePanier.quantite : 0;
            const newQuantitePanier = quantitePanier;
            const codePromo = body.valeur as string;

            const bestProductPromo = await bestAutoReduction(adminClient, modele, client.data, newQuantitePanier, codePromo);

            const { error } = await userClient.from('paniers')
                .upsert({
                    id_user: userId,
                    id_modele: modele.data.id,
                    type_reduction: bestProductPromo ? bestProductPromo.type_reduction : null,
                    type_valeur_reduction: bestProductPromo ? bestProductPromo.type_valeur_reduction : null,
                    valeur_reduction: bestProductPromo ? bestProductPromo.valeur_reduction : null,
                    info_reduction: bestProductPromo ? bestProductPromo.info_reduction : null
                });
            if(error) {
                throw new Error('Impossible de mettre à jour le panier');
            }
        }
    } else if("avoir" === body.type) {
        const avoirs = await userClient.from('avoirs').select('*')
            .eq('numero_client', client.data.numero_client)
            .eq('utilise', false);
        
        if(avoirs.error) {
            console.error(avoirs.error);
            throw new Error('Impossible de récupérer les avoirs');
        }

        const montantBody = body.valeur as number;
        
        const montantAvoirs = avoirs.data.reduce<number>((acc: number, avoir: any) => acc + avoir.montant_restant, 0);
        const montantMaxAvoirs = Math.min(montantBody, montantAvoirs);
        const montantMaxPanier = Math.min(montantPanier, montantMaxAvoirs)
        console.log('montantBody, montantAvoirs, montantMaxAvoirs, montantPanier, montantMaxPanier', montantBody, montantAvoirs, montantMaxAvoirs, montantPanier, montantMaxPanier);

        await adminClient.from('panier_reduction')
            .upsert({
                id_user: userId,
                type_reduction: 'AVOIR',
                type_valeur_reduction: 'MONTANT',
                valeur_reduction: montantMaxPanier,
                info_reduction: `Utilisation de la cagnotte ${montantMaxPanier} €`
            })

    } else if("cheque_cadeau" === body.type) {
              
    } 
    return response;
})