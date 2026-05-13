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

  if(!body.devis_id) {
      return { success: false, error: { message: 'Missing devis_id' }};
  }    
    
  // Get
  const devis = await userClient.from('devis')
    .select('*')
    .eq('id', body.devis_id)
    .single();

  if(devis.error) {
      return { success: false, error: devis.error };
  } else if(devis.data && devis.data.statut !== 'EN_ATTENTE') {
      return { success: false, error: { message: 'Devis is not in EN_ATTENTE status' }};
  }

  if(devis.data) {
    const devisData = devis.data;

    let client = null;
    if(devisData.numero_client )  {
      client = await userClient.from('clients').select('points_fidelite, numero_client').eq('numero_client', devisData.numero_client).single();

      if(client.error)
        return { success: false, error: client.error };
    }

    const commande = await userClient.from('commandes')
      .insert({
        numero_client: client ? client.data.numero_client : null,
        statut: 'ATTENTE_PAIEMENT',
        montant: devisData.montant_total,
        frais_port: devisData.frais_port,
        sans_tva: devisData.sans_tva,
        devis: true,
        mode_livraison: devisData.mode_livraison,
        credit_utilise: devisData.credit_utilise,
        total_reductions: devisData.total_reductions
      }).select('*').single();

    if(commande.error)
      return { success: false, error: commande.error };

    const devisLignes = await userClient.from('devis_lignes')
      .select('*')
      .eq('id_devis', devisData.id);

    if(devisLignes.error) {
        return { success: false, error: devisLignes.error };
    }

    const devisLignesData = devisLignes.data;
    for(const ligne of devisLignesData) {
      const commandeLigne = await userClient.from('commande_lignes')
        .insert({
          id_commande: commande.data.id,
          id_modele: ligne.id_modele,
          code_barre: ligne.code_barre,
          reference_fabricant: ligne.reference_fabricant,
          quantite: ligne.quantite,
          prix_unitaire_ht: ligne.prix_unitaire_ht,
          tva: ligne.tva,
          prix_total_ht: ligne.prix_total_ht,
          prix_total_ttc: ligne.prix_total_ttc,
          cheque_cadeau: ligne.cheque_cadeau,
          cheque_duree: ligne.cheque_duree,
          poids: ligne.poids,
          commentaire: '',
          type_reduction: ligne.type_reduction,
          type_valeur_reduction: ligne.type_valeur_reduction,
          valeur_reduction: ligne.valeur_reduction,
          info_reduction: ligne.info_reduction,
          disponible: ligne.disponible,
        }).select('*').single();

      if(commandeLigne.error)
        return { success: false, error: commandeLigne.error };

      // créer une commande fournisseur avec la différence de stocks
      const modeles = await userClient.from('modeles')
                                      .select('*, stocks!inner(disponible, indisponible, bloque), produits!inner(*, produits_admin!inner(*))')
                                      .eq('id', ligne.id_modele)
                                      .single();
      if(modeles.error) {
        return { success: false, error: modeles.error };
      }

      const stock_min = modeles.data.stock_min;
      const stock_disponible = modeles.data.stocks.disponible;
      const newStock = stock_disponible - ligne.quantite;
      if(newStock < stock_min) {
        const commandeFournisseurLigne = await userClient.from('commande_fournisseur_lignes')
            .select('*, commandes_fournisseur(*)')
            .eq('id_fournisseur',  modeles.data.produits.produits_admin.id_fournisseur)
            .eq('id_modele', ligne.id_modele)
            .or('commandes_fournisseur.statut.eq.BROUILLON, commandes_fournisseur.statut.eq.PARTIELLE')
            .single();
        
        if(commandeFournisseurLigne.data) {
          const updateCommandeFournisseurLigne = await userClient.from('commande_fournisseur_lignes')
            .update({
              quantite: commandeFournisseurLigne.data.quantite + newStock
            })
            .eq('id', commandeFournisseurLigne.data.id);

          if(updateCommandeFournisseurLigne.error)
            return { success: false, error: updateCommandeFournisseurLigne.error };

          if(commandeFournisseurLigne.data) {
            const new_commande_fournisseur_ligne_historique = await userClient.from('commande_fournisseur_lignes_historique')
              .insert({
                id_commande_fournisseur_lignes: (commandeFournisseurLigne.data as any).id,
                id_commande: commande.data.id,
                quantite: newStock,
              }).select('*').single();

            if(new_commande_fournisseur_ligne_historique.error)
              return { success: false, error: new_commande_fournisseur_ligne_historique.error };
          }
        } else {
          const commandeFournisseur = await userClient.from('commandes_fournisseur').insert({
              id_fournisseur: modeles.data.produits.produits_admin.id_fournisseur,
              date_commande: commande.data.date_creation,
              mode_paiement: 'VIREMENT',
              id_club: devis.data.id_club,
              date_creation: new Date().toISOString(),
              statut: 'BROUILLON'
            }).select('*').single();

          if(commandeFournisseur.error)
            return { success: false, error: commandeFournisseur.error };

          const commandeFournisseurLigne = await userClient.from('commande_fournisseur_lignes').insert({
              id_commande_fournisseur: commandeFournisseur.data.id,
              id_modele: ligne.id_modele,
              quantite: newStock,
              quantite_recue: 0,
              prix_unitaire_ht: modeles.data.prix_vente_ht,
              remise: 0,
              tva: modeles.data.produits.tva,
              valid: false
            });
          
          if(commandeFournisseurLigne.error)
            return { success: false, error: commandeFournisseurLigne.error };

          if(commandeFournisseurLigne.data) {
            const new_commande_fournisseur_ligne_hsitorique = await userClient.from('commande_fournisseur_lignes_historique')
              .insert({
                id_commande_fournisseur_lignes: (commandeFournisseurLigne.data as any).id,
                id_commande: commande.data.id,
                quantite: newStock,
              }).select('*').single();
            if(new_commande_fournisseur_ligne_hsitorique.error)
              return { success: false, error: new_commande_fournisseur_ligne_hsitorique.error };
          }
        }
      }
    }

    const devisReductions = await userClient.from('devis_reductions')
      .select('*')
      .eq('id_devis', devisData.id);
    
    if(devisReductions.error) {
        return { success: false, error: devisReductions.error };
    }

    const devisReductionsData = devisReductions.data;
    for(const reduction of devisReductionsData) {
      const commandeReduction = await userClient.from('commande_reductions')
        .insert({
          id_commande: commande.data.id,
          type: reduction.type,
          type_valeur: reduction.type_valeur,
          valeur: reduction.valeur,
          info: reduction.info,
          id_reduction: reduction.id_reduction
        }).select('*').single();

      if(commandeReduction.error)
        return { success: false, error: commandeReduction.error };
    }

    // update the status of the devis
    const updateDevis = await userClient.from('devis').update({ statut: 'VALIDE' }).eq('id', devisData.id);
    if(updateDevis.error)
      return { success: false, error: updateDevis.error };
  }

  return { success: true };
}, {
  allowOnlyAdmin: true
});