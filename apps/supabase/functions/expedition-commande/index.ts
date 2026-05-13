import { mailDispatcher, EmailType } from "../_shared/EmailFunctions.ts";
import { registerFunction } from "../_shared/index.ts";

registerFunction(async ({ req, userClient, user}) => {
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

    if(!body.id_expeditions) {
        return { success: false, error: { message: `Missing id_expeditions`} };
    }

    const expeditionIds = body.id_expeditions.split('_').map((id: string) => parseInt(id));

    const expeditions = await userClient.from('expeditions')
        .select('*, commandes!inner(*, clients!inner(*), commande_adresses!inner(*)), expeditions_lignes(*)')
        .in('id', expeditionIds);
    
    if(expeditions.error) {
        throw new Error(JSON.stringify(expeditions.error));
    }

    // Get commandes Ids from expeditions without duplicates
    const commandesIds = expeditions.data.reduce((acc: number[], expedition: any) => {
        if(!acc.includes(expedition.id_commande)) {
            acc.push(expedition.id_commande);
        }
        return acc;
    }, []);

    // Get corresponding commande's lignes
    const commande_lignes = await userClient.from('commande_lignes')
        .select('*, modeles(id, produits(id, produit_descriptions(*))), commandes(id, expeditions(*, expeditions_lignes(*)))')
        .eq('modeles.produits.produit_descriptions.lang', 'fr')
        .in('id_commande', commandesIds);
    if(commande_lignes.error) {
        throw new Error(JSON.stringify(commande_lignes.error));
    }

    if(commande_lignes.data.length === 0) {
        return { success: false, error: { message: `No ligne found for commandes ${commandesIds}`} };
    }

    // compare the quantity of each ligne with the quantity of the same ligne in expeditions_lignes
    const updateCommande: { id: number, statut: string }[] = [];
    for(const id_commande of commandesIds) {
        const lines_commande = commande_lignes.data.filter((ligne: any) => ligne.id_commande === id_commande);                
        const expedition_lignes = lines_commande.reduce((acc: any[], ligne: any) => {
            const expeditionsLignes = ligne.commandes.expeditions.reduce((acc: any[], expedition: any) => {
                const expeditionLignes = expedition.expeditions_lignes.filter((expeditionLigne: any) => expeditionLigne.id_modele === ligne.id_modele);
                return [...acc, ...expeditionLignes];
            }, []);
            return [...acc, ...expeditionsLignes];
        }, []);

        const quantiteExpediee = expedition_lignes.reduce((acc: number, ligne: any) => acc + ligne.quantite, 0);
        const quantiteCommandee = lines_commande.reduce((acc: number, ligne: any) => acc + ligne.quantite, 0);
        if(quantiteExpediee < quantiteCommandee) {
            updateCommande.push({
                id: id_commande,
                statut: "EXPEDIEE_PARTIELLEMENT"
            });
            const updateCommandes = await userClient.from('commandes')
                .update({
                    statut: "EXPEDIEE_PARTIELLEMENT"
                })
                .eq('id', id_commande);
            if(updateCommandes.error) {
                throw new Error(JSON.stringify(updateCommandes.error));
            }
        }   else {
            updateCommande.push({
                id: id_commande,
                statut: "EXPEDIEE"
            });
            const updateCommandes = await userClient.from('commandes')
                .update({
                    statut: "EXPEDIEE"
                })
                .eq('id', id_commande);
            if(updateCommandes.error) {
                throw new Error(JSON.stringify(updateCommandes.error));
            }
        }
    }

    const updateExpedition = expeditions.data.map((expedition: any) => {
        return {
            id_commande: expedition.id_commande,
            id: expedition.id,
            num_suivis: expedition.num_suivis,
            type: expedition.type,
            date_edition: expedition.date_edition,
            poids: expedition.poids,
            date_creation: expedition.date_creation,
            etiquette: expedition.etiquette,
            etat: true
        };
    });

    const updateExpeditions = await userClient.from('expeditions')
        .upsert(updateExpedition)
        .select();
    if(updateExpeditions.error) {
        throw new Error(JSON.stringify(updateExpeditions.error));
    }

    mailDispatcher[EmailType.EMAIL_EXPEDITION](expeditions, updateCommande, commande_lignes);

    return { success: true };
}, {
    allowOnlyAdmin: true
});