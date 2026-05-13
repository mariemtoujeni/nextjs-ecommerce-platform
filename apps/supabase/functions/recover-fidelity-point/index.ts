import { DeliveryMode, registerFunction } from "../_shared/index.ts";

registerFunction(async ({ req, userClient, adminClient, user}) => {
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

    const retours = await userClient.from('retours')
        .select('*, commandes!inner(numero_client), retours_lignes!inner(*, modeles!inner(*))')
        .eq('commandes.numero_client', user.numero_client)
        .eq('id_commande', body.id_commande)
    if(retours.error) {
        return { success: false, error: retours.error };
    }

    const client = await userClient.from('clients')
        .select('points_fidelite')
        .eq('id', user.id)
        .single();
    if(client.error) {
        return { success: false, error: client.error };
    }

    if(retours.data) {
        // calcule le nombre de points de fidelité à enlever pour chaque retour
        let points_fidelite = 0;
        for (const retour of retours.data) {
            const codePays = retour.commandes.pays;
            const sans_tva = await userClient.from('pays_sans_tva').select('*').eq('code', codePays).single();
            const tvaApplicable = null === sans_tva.data;
            points_fidelite += retour.retours_lignes.reduce((acc : number, rl : any) => acc + rl.quantite * (tvaApplicable ? rl.modeles.prix_vente_ttc : rl.modeles.prix_vente_ht), 0);
        }
        // enlever les points de fidelité
        const  update_client = await userClient.from('clients')
            .update({ points_fidelite: client.data.points_fidelite - points_fidelite })
            .eq('id', user.id);
        if(update_client.error) {
            return { success: false, error: update_client.error };
        }
        return { success: true, data: { points_fidelite: client.data.points_fidelite - points_fidelite } };
    }
    return { success: false, error: { message: 'No return found' } };
}, {
    allowOnlyAdmin: true
});