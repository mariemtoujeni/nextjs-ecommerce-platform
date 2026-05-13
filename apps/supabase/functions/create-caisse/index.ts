// deno-lint-ignore-file
import { registerFunction } from "../_shared/index.ts";
import { randomUUID } from "node:crypto";

registerFunction(async ({ req, userClient, adminClient }) => {
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

    if(!body.id_point_vente) {
        return { success: false, error: { message: `Missing id_point_vente`} };
    }
    const point_vente = await userClient.from('point_ventes').select('*').eq('id', body.id_point_vente).single();
    if(point_vente.error) {
        return { success: false, error: point_vente.error };
    }

    if(!body.caisse_lignes) {
        return { success: false, error: { message: `Missing caisse_lignes`} };
    }

    if(!body.email) {
        return { success: false, error: { message: `Missing email client`} };
    }
    
    // Get or Create a new client if not found
    let client = await userClient.from('clients').select('*').eq('email', body.email).single();
    const caisse = await userClient.from('caisses').insert({
        id_client: client.data ? client.data.numero_client : null,
        id_point_vente: point_vente.data.id,
        contact: client.data ? client.data.email : body.email,
        mode_paiement: body.mode_paiement ? body.mode_paiement : 'ESPECE',
        reduction_type: body.reduction_type ? body.reduction_type : null,
        total_ht: 0,
        total: 0,
        reduction: body.reduction ? body.reduction : 0,
        montant_cb: body.montant_cb ? body.montant_cb : 0,
        montant_espece: body.montant_espece ? body.montant_espece : 0,
        montant_cheque: body.montant_cheque ? body.montant_cheque : 0,
        tva_non_applicable: body.tva_non_applicable ? body.tva_non_applicable : true,
        date_creation: new Date().toISOString(),
        email: !client.data ? body.email : null,
        nom: !client.data ? body.nom ? body.nom : null : null,
        prenom: !client.data ? body.prenom ? body.prenom : null : null,
    }).select('*').single();
    if(caisse.error) {
        return { success: false, error: caisse.error };
    }

    const modeles = await userClient.from('modeles')
        .select('*, modeles_admin!inner(*), produits!inner(*, produit_descriptions!inner(*))')
        .eq('produits.produit_descriptions.lang', 'fr')
        .in('id', body.caisse_lignes.map((ligne: any) => ligne.id_modele));
    if(modeles.error) {
        return { success: false, error: modeles.error };
    }

    let total_ht = 0;
    let total = 0;
    const caisse_lignes = [];
    for(const ligne of body.caisse_lignes) {
        const modele = modeles.data.find((m : any) => m.id === ligne.id_modele);
        if(modele)  {                        
            caisse_lignes.push({
                id_caisse: caisse.data.id,
                id_modele: ligne.id_modele,
                intitule: modele.produits.produit_descriptions[0].titre,
                code_barre: modele.modeles_admin.code_barre,
                prix: ligne.prix ? parseFloat(ligne.prix) : parseFloat(modele.prix_vente_ht),
                quantite: ligne.quantite,
                tva: modele.produits.tva,
                remise: ligne.remise ? ligne.remise : 0,
                comment: ligne.comment ? ligne.comment : null
            });

            total_ht += modele.prix_vente_ht * ligne.quantite;
            total += caisse.data.tva_non_applicable ? (modele.prix_vente_ht * ligne.quantite + (modele.prix_vente_ht * ligne.quantite * modele.produits.tva / 100)) : modele.prix_ht * ligne.quantite;
        }   else {
            return { success: false, error: { message: `Cant found ${ligne.id_modele} in ${modeles.data}`} };
        }
    }

    const caisses_update = await userClient.from("caisses").update({
        total_ht: total_ht,
        total: total
    }).eq('id', caisse.data.id);
    if(caisses_update.error) {
        return { success: false, error: caisses_update.error };
    }

    const caisse_lignes_insertions = await userClient.from('caisse_lignes').insert(caisse_lignes);
    if(caisse_lignes_insertions.error) {
        return { success: false, error: caisse_lignes_insertions.error };
    }

    return { success: true, data: { message: 'Caisse created' } };
}, {
    allowOnlyAdmin: true
});