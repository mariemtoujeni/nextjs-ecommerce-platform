import { createClient } from "jsr:@supabase/supabase-js@2";
import { CommandeStatut, corsHeaders, createAdminAlert, DeliveryMode, SystemPayPassword } from "../_shared/index.ts";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";
import { sendEmailConfirmationCommande, sendEmail } from "../_shared/EmailFunctions.ts";


Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(undefined, { headers: { ...corsHeaders }, status: 200 })
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!
        , Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let userId: string = '';
    let autorisation = '';
    let modePaiement = '';
    let commandeStatut: CommandeStatut = CommandeStatut.ATTENTE_PAIEMENT;

    try {
        let body: any;
        const contentType = req.headers.get('Content-Type');
        if(contentType && contentType.includes('application/json')) {
            body = await req.json();
        } else {
            body = await req.formData();
        }

        if(body.virement) {
            const auth = req.headers.get('Authorization');
            if ("" === auth || !auth) {
                return new Response(undefined, { headers: { ...corsHeaders }, status: 200 })
            }

            const client = createClient(
                Deno.env.get('SUPABASE_URL')!
                , Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
                , { global: { headers: { Authorization: auth } } }
            );

            const getUser = await client.auth.getUser();

            if(getUser.error || !getUser.data.user ) { //|| true === getUser.data.is_anonymous not working
                return new Response(getUser.error?.message, {headers: { ...corsHeaders }, status: 400 })
            }

            userId = getUser.data.user.id;
            modePaiement = 'VIREMENT';
        } else {    
            const algo = body.get('kr-hash-algorithm') as string;

            if("sha256_hmac" !== algo) {
                throw new Error('Invalid hash algorithm');
            }

            const krAnswer = body.get('kr-answer');
            const answer = JSON.parse(krAnswer);

            if("PAID" !== answer.orderStatus) {
                throw new Error('Order not paid');
            }
            
            const hashPassword = SystemPayPassword[answer.orderDetails.mode as keyof typeof SystemPayPassword];

            if(!hashPassword) {
                throw new Error('Invalid hashPassword credentials');
            }

            const expectedHash = body.get('kr-hash') as string;
            const computedHmac = hmac('sha256', hashPassword, krAnswer, 'utf8', 'hex').toString();

            if(expectedHash !== computedHmac) {
                throw new Error('Invalid hash');
            }

            userId = answer.customer.reference;
            autorisation = answer.transactions.map((t: any) => t.uuid).join(',');
            modePaiement = 'SYSTEMPAY';
            commandeStatut = CommandeStatut.PAIEMENT_ACCEPTE;
        }
        
        
        const client = await supabase.from('clients').select('*').eq('id_user', userId).single();
        const panier = await supabase.from('paniers')
            .select('*, modeles(*, modele_attribut_valeurs(*, attribut_valeurs(*)), modeles_admin(*), produits(*, produit_descriptions(*)))')
            .eq('id_user', userId);
        const panier_livraison = await supabase.from('panier_livraison').select('*').eq('id_user', userId).single();
        const panier_reductions = await supabase.from('panier_reduction').select('*').eq('id_user', userId).maybeSingle();
        const adresseFacturation = await supabase.from('client_adresses').select('*').eq('id', panier_livraison.data.id_adresse_facturation).single();

        const error = client.error || panier.error || panier_livraison.error || panier_reductions.error || adresseFacturation.error || undefined
        if(error) {
            await createAdminAlert(supabase, { message: `Erreur création commande: ${JSON.stringify(error)}`, fonction: 'checkout' });
            throw new Error(JSON.stringify(error));
        }
        console.log(`Creating command for user ${userId}`);
        
        
        const codePays = adresseFacturation.data.pays;    
        
        const sans_tva = await supabase.from('pays_sans_tva').select('*').eq('code', codePays).single();
        const tvaApplicable = null === sans_tva.data || undefined === sans_tva.data;
        
        const montantPanier = panier.data?.reduce((acc : number, p: any) => acc + (p.quantite * (tvaApplicable ? p.modeles.prix_vente_ttc : p.modeles.prix_vente_ht) + (p.personalisation ? p.prix : 0)), 0);
        const montantLivraison = panier_livraison.data.prix;

        const finalAmount = montantPanier + montantLivraison;

        // Avoirs reduction
        let valeurReduction = 0
        if(panier_reductions.data) {
            const { type_reduction, type_valeur_reduction, valeur_reduction } = panier_reductions.data;

            if("AVOIR" == type_reduction) {
                valeurReduction = valeur_reduction;
                const avoirs = await supabase.from('avoirs').select('*')        
                    .eq('utilise', false)
                    .eq('numero_client', client.data.numero_client)
                    .order('id', {ascending: true});

                if(avoirs.error) {
                    console.error(avoirs.error);
                } else {

                    let avoirToDeduce = valeur_reduction;

                    for (const avoir of avoirs.data as any[]) {
                        const { montant_restant, id } = avoir;
                        const montantAEnlever = Math.min(avoirToDeduce, montant_restant);
                        const montantRestant = montant_restant - montantAEnlever;
                        await supabase.from('avoirs').update({ montant_restant: montantRestant, utilise: montantRestant === 0 }).eq('id', id);
                        avoirToDeduce -= montantAEnlever;

                        if(avoirToDeduce === 0) {
                            break;
                        }                
                    }
                }
            }
        }

        const commande = await supabase.from('commandes').insert({
            numero_client: client.data.numero_client,
            statut: commandeStatut,
            montant: finalAmount,
            frais_port: panier_livraison.data.prix, // TODO : calculer frais de port HT si sans tva
            sans_tva: !tvaApplicable,
            devis: false,
            mode_livraison: panier_livraison.data.mode_livraison,
            credit_utilise: 0, // TODO Supprimer
            total_reductions: valeurReduction,
            autorisation: autorisation,
            mode_paiement: modePaiement,
            date_autorisation: (new Date()).toISOString()
        }).select().single();

        if(commande.error) {
            await createAdminAlert(supabase, { message: `Erreur création commande: ${commande.error.message}`, fonction: 'checkout' });
            throw new Error(JSON.stringify(commande.error));
        }

        const cmdAdresseFacturation = await supabase.from('commande_adresses').insert({
            id_commande: commande.data?.id,
            type: 'FACTURATION',
            id_relais: null,
            societe: adresseFacturation.data.societe,
            nom: adresseFacturation.data.nom,
            prenom: adresseFacturation.data.prenom,
            adresse: adresseFacturation.data.adresse,
            adresse2: adresseFacturation.data.adresse2,
            adresse3: adresseFacturation.data.adresse3,
            code_postal: adresseFacturation.data.code_postal,
            ville: adresseFacturation.data.ville,
            pays: adresseFacturation.data.pays
        }).select("*").single();

        if(cmdAdresseFacturation.error) {
            await createAdminAlert(supabase, { 
                message: `Erreur création commande adresse facturation: ${cmdAdresseFacturation.error.message}`
                , fonction: 'checkout' });
        }

        let cmdAdresseLivraison = null;
        if( null !== panier_livraison.data.id_adresse 
            && DeliveryMode.AU_MAGASIN !== panier_livraison.data.mode_livraison
        )  {
            const adresseLivraison = await supabase.from('client_adresses').select('*')
                .eq('id', panier_livraison.data.id_adresse)
                .single();
            if(adresseLivraison.data) {
                cmdAdresseLivraison = await supabase.from('commande_adresses').insert({
                    id_commande: commande.data?.id,
                    type: 'LIVRAISON',
                    ...adresseLivraison.data
                }).select("*").single();
                if(cmdAdresseLivraison.error) {
                    await createAdminAlert(supabase, { 
                        message: `Erreur création commande adresse facturation: ${cmdAdresseLivraison.error.message}`
                        , fonction: 'checkout' });
                }
            }
        } else if('' !== panier_livraison.data.id_relais) {
            cmdAdresseLivraison = await supabase.from('commande_adresses').insert({
                id_commande: commande.data?.id,
                type: 'LIVRAISON',
                id_relais: panier_livraison.data.id_relais,
                societe: panier_livraison.data.societe,
                adresse: panier_livraison.data.adresse,
                adresse2: panier_livraison.data.adresse2,
                code_postal: panier_livraison.data.code_postal,
                ville: panier_livraison.data.ville,
                pays: panier_livraison.data.pays
            }).select("*").single();
            
            if(cmdAdresseLivraison.error) {
                await createAdminAlert(supabase, { 
                    message: `Erreur création commande adresse livraison: ${cmdAdresseLivraison.error.message}`
                    , fonction: 'checkout' });
            }
        }
        

        await supabase.from('commandes_admin').insert({
            id_commande: commande.data?.id,
            commentaire_interne: '',
            etat: 'NORMAL'
        });

        if(panier_reductions.data) {
            const panier_reductions_insert = await supabase.from('commande_reductions').insert({
                id_commande: commande.data?.id,
                type: panier_reductions.data.type_reduction,
                type_valeur: panier_reductions.data.type_valeur_reduction,
                id_modele: panier_reductions.data.id_modele,
                valeur: panier_reductions.data.valeur_reduction,
                info: panier_reductions.data.info_reduction,
                id_reduction: panier_reductions.data.id_reduction
            });
            
            if(panier_reductions_insert.error) {
                await supabase.from('admin_alertes').insert({date: new Date().toISOString()
                    , message: `Erreur création commande réduction pour la commande ${commande.data.id}: ${panier_reductions_insert.error.message}.`});
            }
        }
        

        // Recupere le cashback
        // Get last configuration generale from table base on date_creation column
        const configrations_generales = await supabase.from('configurations_generales')
            .select('*')
            .order('date_creation', {ascending: false})
            .single();
        
        if(configrations_generales.error) {
            await supabase.from('admin_alertes').insert({date: new Date().toISOString()
                , message: `Erreur configuration générale: ${configrations_generales.error.message}.\nCashback non attribué pour la commande ${commande.data.id}`});
        }

        if(configrations_generales.data) {
            const { type_duree_validite_cashback, duree_validite_cashback, reduction_cashback } = configrations_generales.data;
            const now = new Date();

            // compute cashback
            const cashback = reduction_cashback * finalAmount / 100;

            // compute expiration date
            const daysToAdd = type_duree_validite_cashback === 'JOUR' ? duree_validite_cashback
                    : type_duree_validite_cashback === 'MOIS' ? duree_validite_cashback * 30
                    : type_duree_validite_cashback === 'ANNEE' ? duree_validite_cashback * 365
                    : 0;
            const date_expiration = new Date(now.setDate(now.getDate() + daysToAdd));

            // insert cashback in table avoirs
            const { error } = await supabase.from('avoirs').insert({
                numero_client: client.data.numero_client,
                type: 'CASHBACK',
                total: cashback,
                date_creation: now.toISOString(),
                date_expiration: date_expiration.getTime() === (new Date()).getTime() ? null : new Date(date_expiration).toISOString(),
                used: false
            });

            if(error) {
                await supabase.from('admin_alertes').insert({date: new Date().toISOString()
                    , message: `Erreur création cashback pour la commande ${commande.data.id} générale: ${error.message}.`});
            }
        }

        const stocks_to_update = [];
        const cheques_cadeaux = [];
        const commande_lignes = [];

        const stocks_array = await supabase.from('stocks')
            .select('*')
            .in('id_modele', panier.data.map((p: any) => p.id_modele));
        if(stocks_array.error) {
            await supabase.from('admin_alertes').insert({date: new Date().toISOString()
                , message: `Erreur récupération stocks pour la commande ${commande.data.id}: ${stocks_array.error.message}.`});
        } else {
        
            for(const p of panier.data) {    
                let intitule = p.modeles.produits.produit_descriptions.find((d: any) => d.lang === 'fr')?.titre;
                intitule += ' - '
                intitule += p.modeles.modele_attribut_valeurs.map((v: any) => v.attribut_valeurs.nom).join(' / ');

                // calculer prix TTC
                const pritTtc = tvaApplicable ? p.modeles.prix_vente_ttc*p.quantite : p.modeles.prix_vente_ht*p.quantite;

                if(p.modeles.produits.cheque_cadeau)    {
                    // Générer un code de chèque cadeau
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    let codeChequeCadeau = '';
                    const charactersLength = characters.length;
                    for (let i = 0; i < 15; i++) {
                        codeChequeCadeau += characters.charAt(Math.floor(Math.random() * charactersLength));
                    }
                    // date de fin est éguale à la date d'aujourd'hui + la durée du chèque cadeau
                    const now = new Date();
                    const dateFin = new Date(now.setMonth(now.getMonth() + p.modeles.produits.cheque_duree));
                    cheques_cadeaux.push({
                        id_commande: commande.data?.id,
                        montant: pritTtc,
                        code: codeChequeCadeau,                
                        date_fin: dateFin,
                        used: false
                    });                    
                }   else {
                    // mise à jours des stocks
                    const { disponible, indisponible } = stocks_array.data.find((s: any) => s.id_modele === p.id_modele);
                    const newStock = disponible - p.quantite;
                    stocks_to_update.push({
                        id_modele: p.id_modele,
                        disponible: newStock,
                        updated_at: new Date().toISOString()
                    })

                    if((newStock + indisponible) < 0)    {
                        const quantiteACommander = Math.abs(newStock + indisponible);
                        
                        // create commande fournisseur
                        const commandeFournisseurLigne = await supabase.from('commande_fournisseur_lignes')
                            .select('*, commandes_fournisseur(*)')
                            .eq('id_fournisseur',  p.modeles.produits.produits_admin.id_fournisseur)
                            .eq('id_modele', p.id_modele)
                            .or('commandes_fournisseur.statut.eq.BROUILLON')
                            .single();
                        
                        if(commandeFournisseurLigne.data) {
                            const updateCommandeFournisseurLigne = await supabase.from('commande_fournisseur_lignes')
                                .update({ quantite: commandeFournisseurLigne.data.quantite + quantiteACommander }).eq('id', commandeFournisseurLigne.data.id);
                            if(updateCommandeFournisseurLigne.error) {
                                await createAdminAlert(supabase, { 
                                    message: `Erreur mise à jour de commande fournisseur la commande ${commande.data.id}: ${updateCommandeFournisseurLigne.error.message}`
                                    , fonction: 'checkout' });
                            }
                        } else {
                            const commandeFournisseur = await supabase.from('commandes_fournisseur').insert({
                                id_fournisseur: p.modeles.produits.produits_admin.id_fournisseur,
                                date_commande: new Date().toISOString(),
                                mode_paiement: 'AUTRE',
                                date_creation: new Date().toISOString(),
                                statut: 'BROUILLON'
                            }).select('*').single();

                            if(commandeFournisseur.error) {
                                await createAdminAlert(supabase, { 
                                    message: `Erreur création commande fournisseur sur la commande ${commande.data.id}: ${commandeFournisseur.error.message}`
                                    , fonction: 'checkout' });
                            }

                            const commandeFournisseurLigne = await supabase.from('commande_fournisseur_lignes').insert({
                                id_commande_fournisseur: commandeFournisseur.data.id,
                                id_modele: p.id_modele,
                                quantite: quantiteACommander,
                                quantite_recue: 0,
                                prix_unitaire_ht: p.modeles.prix_vente_ht,
                                remise: 0,
                                tva: p.modeles.produits ? p.modeles.produits.tva : 0,
                                valid: false
                            });

                            if(commandeFournisseurLigne.error) {
                                await createAdminAlert(supabase, { 
                                    message: `Erreur création commande fournisseur ligne sur la commande ${commande.data.id}: ${commandeFournisseurLigne.error.message}`
                                    , fonction: 'checkout' 
                                    , metadata : {id_commande_fournisseur: commandeFournisseur.data.id, id_modele: p.id_modele, quantiteACommander}});   
                            }
                        }
                    }

                    commande_lignes.push({
                        id_commande: commande.data?.id,
                        id_modele: p.id_modele,
                        code_barre: p.modeles.modeles_admin.code_barre,
                        reference_fabricant: p.modeles.modeles_admin.reference_fabricant,
                        intitule,
                        quantite: p.quantite,
                        prix_unitaire_ht: p.modeles.prix_vente_ht,
                        tva: tvaApplicable ? p.modeles.tva : 0,
                        prix_total_ht: p.modeles.prix_vente_ht * p.quantite,
                        prix_total_ttc: pritTtc,
                        cheque_cadeau: p.modeles.cheque_cadeau ? p.modeles.cheque_cadeau : false,
                        cheque_duree: p.modeles.cheque_duree ? p.modeles.cheque_duree : 0,
                        poids: p.modeles.poids * p.quantite,
                        commentaire: '',
                        type_reduction: p.type_reduction,
                        type_valeur_reduction: p.type_valeur_reduction,
                        valeur_reduction: p.valeur_reduction,
                        info_reduction: p.info_reduction,
                        disponible: "24h" === p.expedition
                    });
                }
            }
        }

        // insert commande lignes
        if(commande_lignes.length > 0) {
            const commandeLignes = await supabase.from('commande_lignes').insert(commande_lignes);
            if(commandeLignes.error) {
                console.error(`Error creating commande lignes ${commandeLignes.error.message}`)
                await supabase.from('admin_alertes').insert({date: new Date().toISOString()
                    , message: `Erreur création commande lignes pour la commande ${commande.data.id}: ${commandeLignes.error.message}.`
                    , metadata: commande_lignes});
            }
        }

        // Mise à jour de stock
        const stocks_array_update = await supabase.from('stocks').upsert(
            [...stocks_to_update]
        ).select();
        if(stocks_array_update.error) {
            await supabase.from('admin_alertes').insert({date: new Date().toISOString()
                , message: `Erreur de mise à jour des stocks pour la commande ${commande.data.id}: ${stocks_array_update.error.message}.`
                , metadata: commande_lignes});
        }

        // insert cheque cadeau
        if(cheques_cadeaux.length > 0) {
            const chequeCadeau = await supabase.from('cheque_cadeau').insert(cheques_cadeaux);
            if(chequeCadeau.error) {
                await createAdminAlert(supabase, { 
                    message: `Erreur création cheque cadeau sur la commande ${commande.data.id}: ${chequeCadeau.error.message}`
                    , fonction: 'checkout'
                    , metadata: cheques_cadeaux});
            }

            //const emailContent = {
            //    Messages: cheques_cadeaux.map((cc: any) => {
            //        return {
            //            From: {
            //                Email: "nicolas@nataquashop.com",
            //                Name: "Nataqushop",
            //            },
            //            To: [                            
            //                {
            //                    Email: client.data.email,
            //                    Name: `${client.data.prenom} ${client.data.nom}`,
            //                }
            //            ],
            //            TemplateID: 6417627,
            //            TemplateLanguage: true,
            //            Subject: "Confirmation de votre commande de chèque cadeau",
            //            Variables: {
            //                code_cheque_cadeau: cc.code,
            //                montant_cheque_cadeau: cc.montant
            //            }
            //        }
            //    })
            //};
            //const emailResponse = await sendEmail(emailContent);
            //if(emailResponse.error) {
            //    return new Response(`Error sending email ${emailResponse.error}`, {status: 400 })
            //}
        }
        

        // Send email for commande creation
        /*
        if(cmdAdresseLivraison && cmdAdresseFacturation && cheques_cadeaux.length === 0) {
            const commandeLigneArray = commande_lignes.map((ligne: any) => {
                return {
                    nom: ligne.intitule,
                    prix_unit: ligne.prix_unitaire_ht + ligne.prix_unitaire_ht * (ligne.tva ? ligne.tva : 0) / 100,
                    quantite: ligne.quantite,
                    prix_total: ligne.prix_total_ttc
                };
            });

            // send email to give an avis on commande
            if(configrations_generales.data) {
                const temporal_unit = configrations_generales.data.type_duree_validite_email_relance;
                const temporal_value = configrations_generales.data.duree_validite_email_relance;
                const date_relance = new Date().setDate(new Date().getDate() + (temporal_unit === 'JOUR' ? temporal_value : temporal_unit === 'MOIS' ? temporal_value * 30 : temporal_unit === 'ANNEE' ? temporal_value * 365 : 0));
                const emailRelance = await supabase.from("emails_relance_avis").insert({
                    id_commande: commande.data.id,
                    id_client: client.data.id,
                    date_creation: (new Date()).toISOString(),
                    date_relance: new Date(date_relance).toISOString(),
                    contenu: JSON.stringify({
                        From: {
                            Email: "nicolas@nataquashop.com",
                            Name: "Nataqushop",
                        },
                        To: [
                            {
                                Email: client.data.email,
                                Name: `${client.data.prenom} ${client.data.nom}`,
                            },
                        ],
                        TemplateID: 6418034,
                        TemplateLanguage: true,
                        Subject: "Votre avis nous intéresse",
                        Variables: {
                            commande_lignes: commandeLigneArray,
                            lien_commande: `${Deno.env.get('FRONT_URL')}/commande/${commande.data.id}`
                        }
                    })
                });
                if(emailRelance.error) {
                    return new Response(`Error creating email relance ${emailRelance.error.message}`, {status: 400 })
                }
            }
        } */
    } catch (e) {
        console.error(JSON.stringify(e));
    }

    await supabase.from('paniers').delete().eq('id_user', userId);
    await supabase.from('panier_reductionn').delete().eq('id_user', userId);
    await supabase.from('panier_livraison').update({valide: false}).eq('id_user', userId);

    return new Response(undefined, {status: 200 })
});