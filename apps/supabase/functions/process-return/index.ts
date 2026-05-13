import { processMap } from "../_shared/CarrierInterface.ts";
import { mailDispatcher, EmailType } from "../_shared/EmailFunctions.ts";
import { registerFunction, wichEnv } from "../_shared/index.ts";
import { Buffer } from "node:buffer";

registerFunction(async ({ req, userClient, adminClient, user }) => {
    const origin = req.headers.get('Origin');
    if(!origin) { 
        throw new Error(`Invalid origin ${origin}`);
    }

    const currentEnv = wichEnv(req.headers.get('Origin') || '');

    let body: any;
    const contentType = req.headers.get('Content-Type');
    if(contentType && contentType.includes('application/json')) {
        body = await req.json();
    } else {
        body = await req.formData();
    }

    if(!body.retourId) {
        throw new Error(`Invalid body`);
    }

    const retour = await userClient.from('retours') // Warning: adminClient throws 500 error
        .select('*, commandes!inner(*)')
        .eq('id', body.retourId)
        .single();

    if(retour.error) {
        throw new Error(`Error fetching retour: ${retour.error.message}`);
    }

    const client = await userClient.from('clients')// Warning: adminClient throws 500 error
        .select('*')
        .eq('numero_client', retour.data.commandes.numero_client).single();
    if(client.error) {
        throw new Error(`Error fetching client ${user.id}: ${client.error.message}`);
    }

    if(retour.data.etat === "REFUSE") {// retour refusé
        await mailDispatcher[EmailType.EMAIL_DEMANDE_RETOUR_REFUSE](userClient, body.retourId, retour.data.id_commande, client);
    }  else if(retour.data.etat === "VALIDE") {// demande retour validée
        const retour_lignes = await userClient.from('retours_lignes')
                .select('*')
                .eq('id_retour', retour.data.id);
        if(retour_lignes.error) {
            throw new Error(`Error fetching retour lignes`);
        }

        const commande_lignes = await userClient.from('commande_lignes')
            .select('*')
            .eq('id_commande', retour.data.id_commande)
            .in('id_modele', retour_lignes.data.map((retour_ligne) => retour_ligne.id_modele));
        
        if(commande_lignes.error) {
            throw new Error(`Error fetching commande lignes`);
        }
        // Check si le client souhaite échanger ou un retourner les produits        
        if(retour.data.type_retour === "ECHANGE")   { // Si c'est un échange, 
            // - on déduit le montant des produits échangés du montant total des produits retournés 
            const montant_produits_retournes = commande_lignes.data.reduce((acc, cl) => {
                const retour_ligne = retour_lignes.data.find((rl) => rl.id_modele === cl.id_modele);
                const prix_unitaire_ttc = cl.prix_unitaire_ht + cl.prix_unitaire_ht * cl.tva / 100;
                return acc + retour_ligne.quantite * prix_unitaire_ttc;
            }, 0);
            
            const modeles_echanges = await userClient.from('modeles')
                .select('*')
                .in('id', retour_lignes.data.map((rl) => rl.id_modele_echange));
            if(modeles_echanges.error) {
                throw new Error(`Erreur lors de la récupération des modèles échangés`);
            }

            const montant_produits_echanges = modeles_echanges.data.reduce((acc, modele) => {
                const retour_ligne = retour_lignes.data.find((rl) => rl.id_modele_echange === modele.id);
                return acc + retour_ligne.quantite * modele.prix_vente_ttc;
            }, 0);

            if(montant_produits_echanges > montant_produits_retournes) //=> Si le montant des produits échangés est supérieur au montant des produits retournés, 
                throw new Error(`Le montant des produits échangés est supérieur au montant des produits retournés`); //* throw une erreur
            else {
                const stocks_modele_remplace = await userClient.from('stocks')
                    .select('*')
                    .in('id_modele', retour_lignes.data.map((retour_ligne) => retour_ligne.id_modele));
                if(stocks_modele_remplace.error) {
                    throw new Error(`Erreur lors de la récupération des stocks des modèles à retourner`);
                }
                
                const stocks_modele_echange = await userClient.from('stocks')
                    .select('*')
                    .in('id_modele', retour_lignes.data.map((retour_ligne) => retour_ligne.id_modele_echange));
                if(stocks_modele_echange.error) {
                    throw new Error(`Erreur lors de la récupération des stocks des modèles qui vont remplacer les modèles retournés`);
                }

                const  stocks_modele_to_update = []
                let new_commande_lignes = [];
                const update_commande_lignes = [];
                for(const retour_ligne of retour_lignes.data) {
                    const previousStock = stocks_modele_remplace.data.find((stock) => stock.id_modele === retour_ligne.id_modele);
                    const previousStockEchange = stocks_modele_echange.data.find((stock) => stock.id_modele === retour_ligne.id_modele_echange);
                    
                    stocks_modele_to_update.push({
                        id_modele: retour_ligne.id_modele,
                        disponible: previousStock.disponible + retour_ligne.quantite,
                        updated_at: new Date()
                    });
                    
                    const modele_echange = modeles_echanges.data.find((modele) => modele.id === retour_ligne.id_modele_echange);
                    new_commande_lignes.push({
                        id_commande: retour.data.id_commande,
                        id_modele: modele_echange.id,
                        quantite: retour_ligne.quantite,
                        prix_unitaire_ht: modele_echange.prix_vente_ht,
                        tva: modele_echange.tva,
                        prix_total_ht: modele_echange.prix_vente_ht * retour_ligne.quantite,
                        prix_total_ttc: modele_echange.prix_vente_ttc * retour_ligne.quantite,
                        poids: modele_echange.poids,
                        commentaire: "Echange",
                        disponible: previousStockEchange.disponible > 0,
                        date_creation: new Date()
                    });
                    update_commande_lignes.push({
                        id: commande_lignes.data.find((cl) => cl.id_modele === retour_ligne.id_modele).id,
                        date_retour: retour.data.date_demande
                    });
                    
                    stocks_modele_to_update.push({
                        id_modele: retour_ligne.id_modele_echange,
                        disponible: previousStockEchange.disponible - retour_ligne.quantite,
                        updated_at: new Date()
                    });
                }

                // * Mettre à jour la colonne date_retour dans la table commande_lignes
                const updateCommandeLigneRequest = await userClient.from('commande_lignes')
                    .upsert(update_commande_lignes);
                if(updateCommandeLigneRequest.error) {
                    throw new Error(`Erreur lors de la mise à jour des lignes de commande de l'ancien produit`);
                }

                // * Créer une nouvelle commande pour les produits échangés
                // * Récupérer la commande à échanger
                const previousCommande = await userClient.from('commandes')
                    .select('*')
                    .eq('id', retour.data.id_commande)
                    .single();
                if(previousCommande.error) {
                    throw new Error(`Erreur lors de la récupération de la commande`);
                }

                const { id, ...rest } = previousCommande.data;

                // * Créer une nouvelle commande pour les produits échangés
                const newCommandeObj : any = await userClient.from('commandes')
                    .insert({
                        ...rest,
                        statut: "PAIEMENT_ACCEPTE",
                        montant: 0,
                        frais_port: 0,
                        reste: 0,
                        date_creation: new Date() 
                    }).select();
                
                if(newCommandeObj.error) {
                    throw new Error(`Erreur lors de la mise à jour du statut de la commande`);
                }

                new_commande_lignes = new_commande_lignes.map((cl) => ({...cl, id_commande: newCommandeObj.data.id}));

                // * Insérer une nouvelle ligne dans la table commande_ligne pour chaque produit échangé
                const newCommandeLignesRequest = await userClient.from('commande_lignes').insert(new_commande_lignes);
                if(newCommandeLignesRequest.error) {
                    throw new Error(`Erreur lors de la création des nouvelles lignes de commande`);
                }

                // * Insérer une nouvelle ligne dans la table commande_adresses pour chaque adresse de la commande
                // * Récupérer les adresses de la commande à échanger
                const previous_commande_adresses = await userClient.from('commande_adresses')
                    .select('*')
                    .eq('id_commande', retour.data.id_commande)
                    .single();
                if(previous_commande_adresses.error) {
                    throw new Error(`Erreur lors de la récupération des adresses de la commande`);
                }
                // * Insérer les nouvelles adresses de la commande
                const { id_commande, ...rest_commande_adresses } = previous_commande_adresses.data;
                const new_commande_adresses = await userClient.from('commande_adresses')
                    .insert({
                        ...rest_commande_adresses,
                        id_commande: newCommandeObj.data.id
                    });
                if(new_commande_adresses.error) {
                    throw new Error(`Erreur lors de la création des nouvelles adresses de la commande`);
                }

                // * Mettre à jour le stock des produits retournés et des produits échangés
                const updateStockRequest = await userClient.from('stocks').upsert(stocks_modele_to_update);
                if(updateStockRequest.error) {
                    throw new Error(`Erreur lors de la mise à jour des stocks`);
                }

                if(montant_produits_echanges < montant_produits_retournes) { //=> Si le montant des produits retournés est supérieur au montant des produits échangés, 
                    //* créer un avoir pour le client
                    const montant_restant = montant_produits_retournes - montant_produits_echanges;
                    const configurations_generales = await userClient.from('configurations_generales')
                        .select('*')
                        .single();                    
                    if(configurations_generales.error) {
                        throw new Error(`Erreur lors de la récupération de la durée de validité de l'avoir`);
                    }

                    const date_expiration = new Date();
                    if(configurations_generales.data.type_duree_validitee_avoir === "JOURS") {
                        date_expiration.setDate(date_expiration.getDate() + configurations_generales.data.duree_validite_avoir);
                    }   else if(configurations_generales.data.type_duree_validitee_avoir === "MOIS") {
                        date_expiration.setMonth(date_expiration.getMonth() + configurations_generales.data.duree_validite_avoir);
                    }  else if(configurations_generales.data.type_duree_validitee_avoir === "ANNEE") {
                        date_expiration.setFullYear(date_expiration.getFullYear() + configurations_generales.data.duree_validite_avoir);
                    }

                    const avoir = {
                        numero_client: client.data.numero_client,
                        id_commande: retour.data.id_commande,
                        total: montant_restant,
                        date_creation: new Date(),
                        date_expiration: date_expiration,
                        type_avoir: "CASHBACK",
                        utilise: false,
                        montant_restant: montant_restant
                    };

                    const avoirRequest = await userClient.from('avoirs')
                        .insert(avoir);
                    if(avoirRequest.error) {
                        throw new Error(`Erreur lors de la création de l'avoir`);
                    }
                }
               
                //* Envoyer un email de confirmation de l'échange
                await mailDispatcher[EmailType.EMAIL_RETOUR_RECU](userClient, retour.data.id, client);
            }
        } else { // Si c'est un retour, 
            // - on mets à jour la colonne date_retour dans la table commande_lignes
            const updateCommandeLigne = []
            for(const ligne of commande_lignes.data) {
                updateCommandeLigne.push({                    
                    id: ligne.id,
                    date_retour: retour.data.date_retour
                });
            }

            const updateCommandeLigneRequest = await userClient.from('commande_lignes')
                .upsert(updateCommandeLigne);
            if(updateCommandeLigneRequest.error) {
                throw new Error(`Error updating commande lignes`);
            }
            
            // - on met à jour le stock des produits retournés
            const stocks = await userClient.from('stocks')
                .select('*')
                .in('id_modele', retour_lignes.data.map((retour_ligne) => retour_ligne.id_modele));
            if(stocks.error) {
                throw new Error(`Error fetching stocks`);
            }
            const updateStock = []
            for(const retour_ligne of retour_lignes.data) {
                const previousStock = stocks.data.find((stock) => stock.id_modele === retour_ligne.id_modele);
                updateStock.push({
                    id_modele: retour_ligne.id_modele,
                    disponible: previousStock.disponible + retour_ligne.quantite,
                    updated_at: new Date()
                });
            }      
            
            const updateStockRequest = await userClient.from('stocks')
                .upsert(updateStock);
            if(updateStockRequest.error) {
                throw new Error(`Error updating stocks`);
            }
            
            // - on crée un avoir avec le montant des produits retournés
            const configurations_generales = await userClient.from('configurations_generales')
                .select('*')
                .single();
            if(configurations_generales.error) {
                throw new Error(`Error fetching configurations generales`);
            }

            const date_expiration = new Date();
            if(configurations_generales.data.type_duree_validitee_avoir === "JOURS") {
                date_expiration.setDate(date_expiration.getDate() + configurations_generales.data.duree_validite_avoir);
            }   else if(configurations_generales.data.type_duree_validitee_avoir === "MOIS") {
                date_expiration.setMonth(date_expiration.getMonth() + configurations_generales.data.duree_validite_avoir);
            }  else if(configurations_generales.data.type_duree_validitee_avoir === "ANNEE") {
                date_expiration.setFullYear(date_expiration.getFullYear() + configurations_generales.data.duree_validite_avoir);
            }

            const montant_total = retour_lignes.data.reduce((acc, retour_ligne) => {
                const cl_4_modele = commande_lignes.data.find((cl) => cl.id_modele === retour_ligne.id_modele);
                const prix_unitaire_ttc = cl_4_modele.prix_unitaire_ht + cl_4_modele.prix_unitaire_ht * cl_4_modele.tva / 100;
                return acc + retour_ligne.quantite * prix_unitaire_ttc;
            }, 0);

            const avoir = {
                numero_client: client.data.numero_client,
                id_commande: retour.data.id_commande,
                total: montant_total,
                date_creation: new Date(),
                date_expiration: date_expiration,
                type: retour.data.type_retour === "AVOIR" ? "CASHBACK" : "REMBOURSEMENT",
                utilise: false,
                montant_restant: montant_total
            };

            const avoirRequest = await userClient.from('avoirs')
                .insert(avoir);
            if(avoirRequest.error) {
                throw new Error(`Erreur lors de la création de l'avoir`);
            }            

            // - envoyer email de la bonne réception des produits en retour            
            await mailDispatcher[EmailType.EMAIL_RETOUR_RECU](userClient, retour.data.id, client);
        }        
    } else if(retour.data.etat === "CONFIRME") { // Demande de retour confirmée
        // Génération de l'étiquette de retour
        try {            
            const process = processMap[retour.data.commandes.mode_livraison];
            if(!process) {
                throw new Error(`Mode de livraison non supporté ${retour.data.commandes.mode_livraison}`);
            }
            
            // Handling Multiple Foreign Keys
            
            const retour_lignes = await userClient.from('retours_lignes')
                .select('*, modeles!id_modele(*)')
                .eq('id_retour', retour.data.id);
            if(retour_lignes.error) {
                throw new Error(`Error fetching retour lignes ${retour_lignes.error.message}`);
            }

            const poids = retour_lignes.data.reduce((acc: number, rl: any) => acc + rl.modeles.poids, 0);

            const commande_adresses = await userClient.from('commande_adresses')
                .select('*')
                .eq('id_commande', retour.data.commandes.id);
            if(commande_adresses.error) {
                throw new Error(`Erreur lors de la récupération de l'adresse de livraison`);
            }

            // deno-lint-ignore no-explicit-any
            let adresseFacturation = commande_adresses.data.find((a: any) => a.type === 'FACTURATION');
            // deno-lint-ignore no-explicit-any
            let adresseLivraison = commande_adresses.data.find((a: any) => a.type === 'LIVRAISON');

            if(!adresseFacturation && adresseLivraison) {
                adresseFacturation = {...adresseLivraison, type: "FACTURATION"};
            }   else if(adresseFacturation && !adresseLivraison) {
                adresseLivraison = {...adresseFacturation, type: "LIVRAISON"};
            }  else if(!adresseFacturation && !adresseLivraison) {
                throw new Error(`Aucune adresse de facturation et/ou de livraison trouvée`);
            }

            const carrier = process(currentEnv);
            await carrier.init();
            const data = await carrier.createReturnLabel({
                id_commande: retour.data.commandes.id,
                numero_client: client.data.numero_client,
                poids: poids,
                livraison: {...adresseLivraison},
                facturation: {...adresseFacturation
                    , email: client.data.email
                    , portable: client.data.telephone_portable
                    , telephone: client.data.telephone_domicile
                }
            });

            if(data.label) {
                const b64 = Buffer.from(data.label).toString('base64');
                const updateRetour = await userClient.from('retours')
                    .update({
                        id: retour.data.id,
                        numero_suivi: data.trackingNumber,
                        updated_at: new Date()
                    });
                if(updateRetour.error) {
                    new Error(`Erreur lors de la mise à jour du retour`);
                }

                // Envoi de l'email de confirmation de la demande de retour avec l'étiquette de retour
                await mailDispatcher[EmailType.EMAIL_DEMANDE_RETOUR_VALIDATION](userClient, retour.data.id, b64, client);
            }
        } catch(e) {
            throw new Error(`Erreur lors de la génération de l'étiquette de retour: ${e.message}`);
        }
    }

    return { success: true};
});