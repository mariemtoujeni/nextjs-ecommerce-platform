import { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export type ReductionCodePromoType = {
    code_promo_amount: number;
    reductionCodePromo: any;
}

export const computePromoAmount = (reductionLigne: any, modele: any) => {
    let motant_reduction = 0;             
    if(reductionLigne.type_valeur === 'MONTANT') {
        motant_reduction = reductionLigne.valeur;
    } else if(reductionLigne.type_valeur === 'POURCENTAGE') {
        motant_reduction = modele.prix_vente_ht * reductionLigne.valeur / 100;
    }
    return motant_reduction;
}

export const conditionMinimalAchatVerifier = (reduction: any, montant: number, quantite: number) => {
    if(!reduction.type_condition_achat_min) {
        return true;
    } else if(reduction.type_condition_achat_min === 'MONTANT' && parseFloat(reduction.valeur_condition_achat_min) <= (montant * quantite)) {
        return true;
    } else if(reduction.type_condition_achat_min === 'QUANTITE_PRODUIT' && parseFloat(reduction.valeur_condition_achat_min) <= quantite) {
        return true;
    }
    return false;
}

export const getReductionCodePromo = async (userClient: SupabaseClient, codePromo: string, paniers: any[], montant: number) : Promise<ReductionCodePromoType> => {
    let code_promo_amount = 0;
    let reductionCodePromo = null;
    if(!codePromo) 
        return { code_promo_amount, reductionCodePromo };
    
    const promo = await userClient.from('reductions').select('*')
        .eq('code', codePromo)
        .eq('etat', 'ACTIVE')
        .single();

    if(promo.error) {
        throw new Error(promo.error.message);
    }

    const sum_quantite = paniers.reduce((acc: number, p: any) => acc + p.quantite, 0);
    const promo_ligne = await userClient.from('reduction_lignes').select('*')
        .eq('id_reduction', promo.data.id)
        .eq('type', "EN_PROMO")
        .single();

    if(promo.data && promo.data.type_condition_achat_min === 'MONTANT' && promo.data.valeur_condition_achat_min <= montant) {
        if(promo_ligne.data && promo_ligne.data.type_valeur === 'MONTANT') {
            code_promo_amount = promo_ligne.data.valeur;
            reductionCodePromo = promo.data;
        } else if(promo_ligne.data && promo_ligne.data.type_valeur === 'POURCENTAGE') {
            code_promo_amount = promo_ligne.data.valeur * montant / 100;
            reductionCodePromo = promo.data;
        }
    } else if(promo.data && promo.data.type_condition_achat_min === 'QUANTITE_PRODUIT' && promo.data.valeur_condition_achat_min <= sum_quantite) {
        if(promo_ligne.data && promo_ligne.data.type_valeur === 'MONTANT') {
            code_promo_amount = promo_ligne.data.valeur;
            reductionCodePromo = promo.data;
        } else if(promo_ligne.data && promo_ligne.data.type_valeur === 'POURCENTAGE') {
            code_promo_amount = promo_ligne.data.valeur * montant / 100;
            reductionCodePromo = promo.data;
        }
    }

    return { code_promo_amount, reductionCodePromo };
}

export const computeTotalReduction = async ( 
    panierContent: any[] | null, panier_reductions: any[] | null, 
    montantCommande: number, supabase: SupabaseClient, 
    currentAppliedReduction: any, contry_code: string, 
    frais_port: number, onlyClubReduction = false ) => {    
    
    if(!panierContent || !panier_reductions) return 0;

    let sommeReductionProductAmout = 0;
    // 1 case: if the current user has a code promo reduction and can cumulate it with the product reductions
    if(panierContent && !onlyClubReduction 
        && (!currentAppliedReduction || (currentAppliedReduction && currentAppliedReduction.combinaison === 'PRODUIT'))
    ) {
        sommeReductionProductAmout = panierContent.reduce((acc, p) => acc + p.valeur_reduction, 0);
    }

    // 2 case: if the current user has an expedition reduction
    let reductionExpeditionAmout = 0;
    if( panier_reductions && !onlyClubReduction
        && (!currentAppliedReduction || (currentAppliedReduction && currentAppliedReduction.combinaison === 'EXPEDITION'))
    ) {        
        const reducLines = await supabase.from('reduction_lignes').select('*, reductions!inner(etat)')
        .eq('reductions.type', 'EXPEDITION')
        .eq('reductions.etat', 'ACTIVE')
        .single();
        
        // let listCodePays = [];
        // if(reducLines.data) {
        //     listCodePays = reducLines.data.map((rl: any) => rl.country_code);
        //     listCodePays = listCodePays.filter((rl: any) => rl !== null);
        // }
        
        // if(listCodePays.includes(contry_code) || listCodePays.length === 0)
        reductionExpeditionAmout = reducLines.data.type_valeur === "MONTANT" ? reducLines.data.valeur : parseFloat((frais_port * reducLines.data.valeur / 100).toFixed(2));
    }

    // 3 case: if the current user has a club reduction
    let reductionClubAmout = 0;
    if(panier_reductions)   {
        const reductionClub = panier_reductions.find((r: any) => r.type_reduction === 'CLUB' || r.type_reduction === 'ADHERENT_CLUB');
        if(reductionClub && reductionClub.type_valeur_reduction === 'MONTANT') {
            reductionClubAmout = reductionClub.valeur_reduction;
        }   else if(reductionClub && reductionClub.type_valeur_reduction === 'POURCENTAGE') {
            reductionClubAmout = parseFloat((montantCommande * reductionClub.valeur_reduction / 100).toFixed(2));
        }
    }

    // 4 case: TODO process reduction X pour Y

    return sommeReductionProductAmout + reductionExpeditionAmout + reductionClubAmout;
}

export const getBestReduction = async (reductionLigne: any, modele: any, bestProductReduction: any, quantite: number) => {
    if(reductionLigne.type !== 'EXPEDITION') {
        const motant_reduction = computePromoAmount(reductionLigne, modele);
        if(!bestProductReduction || bestProductReduction.valeur_reduction < motant_reduction)    
            return {
                type_reduction: reductionLigne.reductions.type,
                type_valeur_reduction: reductionLigne.type_valeur,
                valeur_reduction: motant_reduction * quantite,
                info_reduction: reductionLigne.reductions.id
            };
    }   else { //Que les reductuion type MONTANT est traitées car a ce stade on ne connait pas encore le montant de frais de port et on ne peut pas appliquer un pourcentage
        if(!bestProductReduction || bestProductReduction.valeur_reduction < reductionLigne.valeur)    
            return {
                type_reduction: reductionLigne.reductions.type,
                type_valeur_reduction: reductionLigne.type_valeur,
                valeur_reduction: reductionLigne.valeur * quantite,
                info_reduction: reductionLigne.reductions.id
            };
    }
    return bestProductReduction;
}

export const bestAutoReduction = async (adminClient: SupabaseClient, modele: any, client: any, quantite: number, codePromo: string = "") => {    
    let bestProductReduction = null;
    const now = new Date();

    //check the existance of reduction having a type CAMPAGNE or for the club or for the adherent club of the user
    // TODO: check how we can group the 3 queries in one, I obtain an error when I try to do it with the OR operator
    let reductionLignes = [];
    const reductionLignesClub = await adminClient.from('reduction_lignes')
        .select('*, reductions!inner(*)')
        .gte('reductions.date_fin', now.toISOString())
        .lte('reductions.date_debut', now.toISOString())
        .eq('reductions.etat', 'ACTIVE')
        .eq('reductions.id_club', client.id_club);

    if(reductionLignesClub.data) {
        reductionLignes = reductionLignesClub.data;
    }

    const reductionLignesAdhe = await adminClient.from('reduction_lignes')
        .select('*, reductions!inner(*)')
        .gte('reductions.date_fin', now.toISOString())
        .lte('reductions.date_debut', now.toISOString())
        .eq('reductions.etat', 'ACTIVE')
        .eq('reductions.id_club', client.id_club_adherent);

    if(reductionLignesAdhe.data) {
        reductionLignes = [...reductionLignes, ...reductionLignesAdhe.data];
    }

    const reductionLignesCompagne = await adminClient.from('reduction_lignes')
        .select('*, reductions!inner(*)')
        .gte('reductions.date_fin', now.toISOString())
        .lte('reductions.date_debut', now.toISOString())
        .eq('reductions.etat', 'ACTIVE')
        .eq('reductions.type', 'CAMPAGNE');
    if(reductionLignesCompagne.data) {
        reductionLignes = [...reductionLignes, ...reductionLignesCompagne.data];
    }

    if(codePromo && codePromo !== "") {
        const reductionCodePromo = await adminClient.from('reduction_lignes')
            .select('*, reductions!inner(*)')            
            .gte('reductions.date_fin', now.toISOString())
            .lte('reductions.date_debut', now.toISOString())            
            .eq('etat', 'ACTIVE')
            .eq('reductions.code', codePromo);
        if(reductionCodePromo.data) {
            reductionLignes = [...reductionLignes, ...reductionCodePromo.data];
        }
    }

    // remove duplicates
    reductionLignes = reductionLignes.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

    if(reductionLignes && modele && client) {
        for(const reductionLigne of reductionLignes) {            
            if( reductionLigne.type === 'CATEGORIE' 
                && reductionLigne.id_type === modele.produits.id_categorie
                && conditionMinimalAchatVerifier(reductionLigne.reductions, parseFloat(modele.prix_vente_ht), quantite)
             ) {
                bestProductReduction = getBestReduction(reductionLigne, modele, bestProductReduction, quantite);
            } else if( reductionLigne.type === 'MODELE' 
                && reductionLigne.id_type === modele.id 
                && conditionMinimalAchatVerifier(reductionLigne.reductions, parseFloat(modele.prix_vente_ht), quantite)
            ) {
                bestProductReduction = getBestReduction(reductionLigne, modele, bestProductReduction, quantite);
            } else if( reductionLigne.type === 'MARQUE' 
                && reductionLigne.id_type === modele.produits.id_marque 
                && conditionMinimalAchatVerifier(reductionLigne.reductions, parseFloat(modele.prix_vente_ht), quantite)
            ) {
                bestProductReduction = getBestReduction(reductionLigne, modele, bestProductReduction, quantite);
            } else if( reductionLigne.type === 'SOUS_CATEGORIE' 
                && reductionLigne.id_type === modele.produits.id_sous_categories 
                && conditionMinimalAchatVerifier(reductionLigne.reductions, parseFloat(modele.prix_vente_ht), quantite)
            ) {
                bestProductReduction = getBestReduction(reductionLigne, modele, bestProductReduction, quantite);
            } else if( reductionLigne.type === 'PRODUIT' 
                && reductionLigne.id_type === modele.id_produit 
                && conditionMinimalAchatVerifier(reductionLigne.reductions, parseFloat(modele.prix_vente_ht), quantite)
            ) {
                bestProductReduction = getBestReduction(reductionLigne, modele, bestProductReduction, quantite);
            } else if( reductionLigne.type === 'COLLECTION'
                && reductionLigne.id_type === modele.produits.collection_produits.collections.id_collection
                && conditionMinimalAchatVerifier(reductionLigne.reductions, parseFloat(modele.prix_vente_ht), quantite)
            ) {
                bestProductReduction = getBestReduction(reductionLigne, modele, bestProductReduction, quantite);
            } else if( reductionLigne.type === 'EXPEDITION' // Maybe need to add a condition for the country but it's not known at this stage since this function is called before the user has entered his address
                && conditionMinimalAchatVerifier(reductionLigne.reductions, parseFloat(modele.prix_vente_ht), quantite)
            ) {
                bestProductReduction = getBestReduction(reductionLigne, modele, bestProductReduction, quantite);
            }
        }
    }
    return bestProductReduction;
}