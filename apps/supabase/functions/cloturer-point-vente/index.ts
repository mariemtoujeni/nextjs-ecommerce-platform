import { registerFunction } from "../_shared/index.ts";

registerFunction(async ({ req, userClient, adminClient, user}) => {
    const origin = req.headers.get('Origin');

    if(!origin) {
        throw new Error(`Invalid origin ${origin}`);
    }

    let body: any;
    const contentType = req.headers.get('Content-Type');
    if(contentType && contentType.includes('application/json')) {
        body = await req.json();
    } else {
        body = await req.formData();
    }

    if(!body.id_point_vente) {
        throw new Error(`Missing id_point_vente`);
    }    

    // check if the modele is already in the point_vente_lignes
    const caisse_lignes = await userClient.from('caisse_lignes').select('*, caisses!inner(*)')
        .eq('caisses.id_point_vente', body.id_point_vente);
    if(caisse_lignes.error) {
        throw new Error(JSON.stringify(caisse_lignes.error));
    }

    const id_modeles_caisse = [ ...new Set(caisse_lignes.data.map((curr: any) => {
        return curr.id_modele;
    }))];


    const point_vente_lignes = await userClient.from('point_vente_lignes').select('*, modeles!inner(*, stocks!inner(*), produits!inner(*, produits_admin!inner(*)))')
        .eq('id_point_vente', body.id_point_vente)
        .in('id_modele', id_modeles_caisse);
    if(point_vente_lignes.error) {
        throw new Error(JSON.stringify(point_vente_lignes.error));
    }

    const point_vente_lignes_array = [];
    const stocks_array = [];
    for(const ligne of point_vente_lignes.data) {
        // Calculer la quantite vendue
        const quantite_vendue = ligne.stock_vendu === -999 ? caisse_lignes.data.filter((cl: any) => cl.id_modele === ligne.id_modele).reduce((acc: number, curr: any) => acc + curr.quantite, 0) : ligne.stock_vendu;
        
        // Gestion des stocks et des commandes fournisseurs
        const { disponible, indisponible } = ligne.modeles.stocks;
        const newStock = disponible - quantite_vendue;
        
        if((newStock + indisponible) < 0)    {
            let quantiteACommander = 0;
            stocks_array.push({
                id_modele: ligne.modeles.id,
                disponible: newStock
            });            

            if(newStock < 0) {                
                quantiteACommander = Math.abs(newStock);
            }
            
            const commandeFournisseurLigne = await userClient.from('commande_fournisseur_lignes')
                .select('*, commandes_fournisseur(*)')
                .eq('id_fournisseur',  ligne.modeles.produits.produits_admin.id_fournisseur)
                .eq('id_modele', ligne.id_modele)
                .or('commandes_fournisseur.statut.eq.BROUILLON, commandes_fournisseur.statut.eq.PARTIELLE')
                .single();
            
            if(commandeFournisseurLigne.data) {
                const updateCommandeFournisseurLigne = await userClient.from('commande_fournisseur_lignes')
                    .update({ quantite: commandeFournisseurLigne.data.quantite + quantiteACommander }).eq('id', commandeFournisseurLigne.data.id);
                if(updateCommandeFournisseurLigne.error)
                    throw new Error(JSON.stringify(updateCommandeFournisseurLigne.error));
            } else {
                const commandeFournisseur = await userClient.from('commandes_fournisseur').insert({
                    id_fournisseur: ligne.modeles.produits.produits_admin.id_fournisseur,
                    date_commande: new Date().toISOString(),
                    mode_paiement: 'AUTRE',
                    date_creation: new Date().toISOString(),
                    statut: 'BROUILLON'
                }).select('*').single();
                if(commandeFournisseur.error)
                    throw new Error(JSON.stringify(commandeFournisseur.error));

                const commandeFournisseurLigne = await userClient.from('commande_fournisseur_lignes').insert({
                    id_commande_fournisseur: commandeFournisseur.data.id,
                    id_modele: ligne.id_modele,
                    quantite: quantiteACommander,
                    quantite_recue: 0,
                    prix_unitaire_ht: ligne.modeles.prix_vente_ht,
                    remise: 0,
                    tva: ligne.modeles.produits.tva,
                    valid: false
                  });
                
                if(commandeFournisseurLigne.error)
                    throw new Error(JSON.stringify(commandeFournisseurLigne.error));
            }
        }

        point_vente_lignes_array.push({
            id_modele: ligne.id_modele,
            id_point_vente: ligne.id_point_vente,
            stock_final: ligne.stock_final === -999 ? ligne.stock_initial - quantite_vendue : ligne.stock_final
        });        
    }
    // Mise à jour de stock
    const stocks_array_update = await userClient.from('stocks').upsert(
        [...stocks_array]
    ).select();
    if(stocks_array_update.error) {
        throw new Error(JSON.stringify(stocks_array_update.error));
    }

    // Mise à jour de ligne point de vente
    const point_vente_lignes_array_update = await userClient.from('point_vente_lignes').upsert(
        [...point_vente_lignes_array]
    ).select();
    if(point_vente_lignes_array_update.error) {
        throw new Error(JSON.stringify(point_vente_lignes_array_update.error));
    }

    // cloturer les caisses
    const caisses_list = await userClient.from('caisses')
        .select('*')
        .eq('id_point_vente', body.id_point_vente)
        .eq('statut', 'ACTIF');
    if(caisses_list.error) {
        throw new Error(caisses_list.error.message);
    }
    
    const caisses_update = [];
    for(const caisse of caisses_list.data) {
        caisses_update.push({
            ...caisse,
            statut: 'FINALISE'
        });
    }
    const updateCaisses = await userClient.from('caisses').upsert(
        caisses_update
    ).select();
    if(updateCaisses.error) {
        throw new Error(JSON.stringify(updateCaisses.error));
    }

    // Cloturer le point de vente
    const updatePointVente = await userClient.from('point_ventes')
        .update({ actif: false, date_fin: new Date().toISOString() })
        .eq('id', body.id_point_vente).select('*').single();
    if(updatePointVente.error) {
        throw new Error(updatePointVente.error.message);
    }

    return { success: true, message: 'Point de vente est cloturé avec succès', data: updatePointVente.data };
}, {
    allowOnlyAdmin: true
});