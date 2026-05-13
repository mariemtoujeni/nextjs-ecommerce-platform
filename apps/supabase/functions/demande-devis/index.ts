import { EmailType, mailDispatcher } from "../_shared/EmailFunctions.ts";
import { registerFunction } from "../_shared/index.ts";
import { computeTotalReduction } from "../_shared/ReductionFunctions.ts";

registerFunction(async ({ req, userClient, user}) => {
    const origin = req.headers.get('Origin');

    if(!origin) {
        return { success: false, error: { message: `Invalid origin ${origin}`} };
    }

    const client = await userClient.from('clients').select('*').eq('id_user', user.id).single();
    if(client.error) {
        throw new Error(`Error getting client: ${client.error.message}`);
    }

    const panier_livraison = await userClient.from('panier_livraison').select('*').eq('id_user', user.id).single();
    if(panier_livraison.error) {
        throw new Error(`Error getting panier_livraison: ${panier_livraison.error.message}`);
    }

    const adresseFacturation = await userClient.from('client_adresses')
        .select('*').eq('id', panier_livraison.data.id_adresse_facturation).single();
    if(adresseFacturation.error) {
        throw new Error(`Error getting adresseFacturation: ${adresseFacturation.error.message}`);
    }
    const codePays = adresseFacturation.data.pays;
    const sans_tva = await userClient.from('pays_sans_tva')
        .select('*').eq('code', codePays).single();
    const tvaApplicable = null === sans_tva.data;

    const panier = await userClient.from('paniers')
        .select('*, modeles!inner(*, modele_attribut_valeurs!inner(*, attribut_valeurs!inner(*)), modeles_admin!inner(*), produits!inner(*, produit_descriptions!inner(*)))')
        .eq('id_user', user.id)
        .eq('modeles.produits.produit_descriptions.lang', 'fr');
    if(panier.error) {
        throw new Error(`Error getting panier: ${panier.error.message}`);
    }

    const panier_reductions = await userClient.from('panier_reductions').select('*').eq('id_user', user.id);
    if(panier_reductions.error) {
        throw new Error(`Error getting panier_reductions: ${panier_reductions.error.message}`);
    }

    const montant = panier.data?.reduce((acc : number, p: any) => acc + (p.quantite * (tvaApplicable ? p.modeles.prix_vente_ttc : p.modeles.prix_vente_ht) + (p.personalisation ? p.prix : 0)), 0);

    const code_promo_amount = 0;

    // Calculer reductions
    let automated_reduction_amount = 0;        
    automated_reduction_amount = await computeTotalReduction(
        panier.data, panier_reductions.data, montant, userClient, null, codePays, panier_livraison.data.prix, true
    );

    // Calculer montant final
    const finalAmount = ((automated_reduction_amount + code_promo_amount) <= montant ? montant - (automated_reduction_amount + code_promo_amount) : 0);
    
    const devis = await userClient.from('devis').insert({
        statut: 'EN_ATTENTE',
        intitule: `Devis ${client.data.numero_client} - ${new Date().toISOString()}`,
        numero_client: client.data.numero_client,
        id_club: client.data.id_club,
        credit_utilise: 0,
        montant_total: finalAmount,
        frais_port: panier_livraison.data.prix,
        mode_livraison: panier_livraison.data.mode_livraison,
        sans_tva: false,
        total_reductions: ((automated_reduction_amount + code_promo_amount) < montant ? (automated_reduction_amount + code_promo_amount) : montant), //+ fidelityDiscount,
        date_creation: (new Date()).toISOString()
    }).select().single();

    if(devis.error) {
        throw new Error(`Error creating devis ${devis.error.message}`);
    }

    if(panier_reductions.data)  {
        const devis_reductions = [];
        for(const pr of panier_reductions.data) {
            devis_reductions.push({
                id_devis: devis.data?.id,
                type: pr.type_reduction,
                type_valeur: pr.type_valeur_reduction,
                valeur: pr.valeur_reduction,
                info: pr.info_reduction,
                id_reduction: pr.id_reduction,
                date: (new Date()).toISOString()
            });
        }

        if(devis_reductions.length > 0) {
            const devisReductions = await userClient.from('devis_reductions').insert(devis_reductions);
            if(devisReductions.error) {
                throw new Error(`Error creating devis reductions ${devisReductions.error.message}`)
            }
        }
    }

    if(panier.data)   {
        const devis_lignes = [];
        for(const p of panier.data) {
    
            let intitule = p.modeles.produits.produit_descriptions.find((d: any) => d.lang === 'fr')?.titre;
            intitule += ' - '
            intitule += p.modeles.modele_attribut_valeurs.map((v: any) => v.attribut_valeurs.nom).join(' / ');

            // calculer prix TTC
            const pritTtc = tvaApplicable ? p.modeles.prix_vente_ttc*p.quantite : p.modeles.prix_vente_ht*p.quantite;

            devis_lignes.push({
                id_devis: devis.data?.id,
                id_modele: p.id_modele,
                type_reduction: p.type_reduction,
                type_valeur_reduction: p.type_valeur_reduction,
                code_barre: p.modeles.modeles_admin.code_barre,
                reference_fabricant: p.modeles.modeles_admin.reference_fabricant,
                quantite: p.quantite,
                prix_unitaire_ht: p.modeles.prix_vente_ht,
                tva: tvaApplicable ? p.modeles.produits.tva : 0,
                prix_total_ht: p.modeles.prix_vente_ht * p.quantite,
                prix_total_ttc: pritTtc,
                cheque_cadeau: false,
                cheque_duree: 0,
                poids: p.modeles.poids * p.quantite,
                commentaire: '',
                valeur_reduction: p.valeur_reduction,
                info_reduction: p.info_reduction,
                disponible: "24h" === p.expedition,
                date_creation: (new Date()).toISOString()
            });
        }
        
        if(devis_lignes.length > 0) {
            const devisLignes = await userClient.from('devis_lignes').insert(devis_lignes);
            if(devisLignes.error) {
                throw new Error(`Error creating devis lignes ${devisLignes.error.message}`);
            }
        }
    }

    await userClient.from('paniers').delete().eq('id_user', user.id);
    await userClient.from('panier_reductions').delete().eq('id_user', user.id);
    await userClient.from('panier_livraison').update({valide: false}).eq('id_user', user.id);

    // Envoyer email de confirmation de devis
    await mailDispatcher[EmailType.EMAIL_DEMANDE_DEVIS](userClient, devis.data.id, client);

    return { success: true, data: devis.data };
});