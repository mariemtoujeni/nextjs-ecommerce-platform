import { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import * as base64 from "jsr:@std/encoding/base64";
import { BodyResponse, ErrorCodes } from "../_shared/index.ts";

export const enum EmailType {
  EMAIL_COMPTE_CONFIRMATION = 'email_confirmation_compte',
  EMAIL_COMPTE_VERIFICATION = 'email_confirmed_compte',
  EMAIL_COMMANDE_CONFIRMATION = 'email_commande_confirmation',
  EMAIL_PREPARATION_COMMANDE = 'email_preparation_commande',
  EMAIL_EXPEDITION = 'email_expedition',
  EMAIL_DEMANDE_RETOUR_VALIDATION = 'email_demande_retour_validation',
  EMAIL_RETOUR_RECU = 'email_retour_recu',
  EMAIL_AVOIR_CREATION = 'email_avoir_creation',
  EMAIL_CONFIRMATION_RETRACTION = 'email_confirmation_retraction',
  EMAIL_ENVOYER_CHEQUE_CADEAU = 'email_envoyer_cheque_cadeau',
  EMAIL_DEMANDE_AVIS = 'email_demande_avis',
  EMAIL_CREATE_CASHBACK = 'email_create_cashback',
  EMAIL_DEMANDE_DEVIS = 'email_demande_devis',
  EMAIL_Modele_DISPONIBLE = 'email_modele_disponible',
  EMAIL_DEMANDE_RETOUR_REFUSE = 'email_demande_retour_refuse',
}

const apiKey = 'd5b85c0267fd2790c0ca4a9d07ea8f1f';
const apiSecret = '990ee4aa66262b62083fac23181550bc';

const mailjetUrl = "https://api.mailjet.com/v3.1/send";
const newsLetterBaseURL = "https://api.mailjet.com/v3/REST/contact";
const newsLetterListId = "10497162";

export type CommandeLigne = {
  nom: string,
  prix_unit?: number,
  quantite: number,
  prix_total?: number,
}

export const sendNewsletter = async (email: string) => {
  const response: BodyResponse = { success: true };
  
  // Encode the credentials to Base64
  const credentials = base64.encodeBase64(`${apiKey}:${apiSecret}`);

  const responseEmail = await fetch(`${newsLetterBaseURL}/${email}/managecontactslists`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ContactsLists: [ { Action:"addforce", ListID: newsLetterListId } ] })
  });

  if (responseEmail.ok) {
    const data = await responseEmail.json();
    response.message = data;
  }   else {
      const errorData = await responseEmail.text();
      response.success = false;
      response.code = ErrorCodes.NEWSLETTER_INSCRIPTION_FAILED;
      response.error = JSON.parse(errorData);
  }
}

export const sendEmail = async (emailContent: any) => {
  const response: BodyResponse = { success: true };
  
  // Encode the credentials to Base64
  const credentials = base64.encodeBase64(`${apiKey}:${apiSecret}`);

  const responseEmail = await fetch(mailjetUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailContent)
  });

  if (responseEmail.ok) {
    const data = await responseEmail.json();
    response.message = data;
  }   else {
      const errorData = await responseEmail.text();
      response.success = false;
      response.code = ErrorCodes.EMAIL_IMPOSSIBLE;
      response.error = JSON.parse(errorData);
  }
  
  return response;
}

export const sendEmailDemandeDevis = async (userClient: SupabaseClient, devisId: number, client: any) => {
  const devisLignes = await userClient.from('devis_lignes')
    .select('*, devis!inner(intitule), modeles!inner(produits!inner(*, produit_descriptions!inner(*)))')
    .eq('id_devis', devisId)
    .eq('modeles.produits.produit_descriptions.lang', 'fr');
  if(devisLignes.error) {
    console.error(devisLignes.error);
    return;
  }

  const emailContent = {
    Messages:[
      {
        From: {
          Email: "nicolas@nataquashop.com",
          Name: "Nataqushop",
        },
        To: [                            
          {
              Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email ,
              Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
          }
        ],
        TemplateID: 6449479,
        TemplateLanguage: true,
        Subject: "Votre devis est disponible dans votre espace Club",
        Variables: {
          produits: devisLignes.data.map((ligne: any) => ligne.modeles.produits.produit_descriptions[0].titre),
          intitule_devis: devisLignes.data[0].devis.intitule
        }
      }
    ]
  };

  const emailResponse = await sendEmail(emailContent);
  if(emailResponse.error)
    console.error(emailResponse.error);
  return { success: true, emailResponse };
}

export const sendEmailDemandeAvis = async (userClient: SupabaseClient) => {
  const emailRelance = await userClient.from('emails_differer')
          .select('*')
          .eq('is_delivered', false)
          .lt('date_relance', new Date().toISOString().split('T')[0]);

  if(emailRelance.error) {
      return { success: false, error: { message: `${emailRelance.error.message}` } };
  }

  const messages = emailRelance.data.map((email: any) => JSON.parse(email.contenu));
  if(messages.length === 0) {
      return { success: true, data: { message: 'No email to send'} };
  }

  const emailResponse = await sendEmail({Messages: messages});
  if(emailResponse.error)
    console.error(emailResponse.error);

  const deleteResponse = await userClient.from('emails_differer')
        .delete()
        .in('id', emailRelance.data.map((email: any) => email.id));
  if(deleteResponse.error) {
    throw new Error(`${deleteResponse.error.message}`);
  }        
  return { success: true, data: { message: 'Email sent'} };
}

export const sendEmailChequeCadeau = async (cheques_cadeaux: any[], client: any) => {
  const emailContent = {
    Messages: cheques_cadeaux.map((cc: any) => {
        return {
            From: {
                Email: "nicolas@nataquashop.com",
                Name: "Nataqushop",
            },
            To: [                            
                {
                    Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email ,
                    Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
                }
            ],
            TemplateID: 6417627,
            TemplateLanguage: true,
            Subject: "Confirmation de votre commande de chèque cadeau",
            Variables: {
                code_cheque_cadeau: cc.code,
                montant_cheque_cadeau: cc.montant
            }
        }
    })
  };
  const emailResponse = await sendEmail(emailContent);
  if(emailResponse.error)
    console.error(emailResponse.error);
  return { success: true, emailResponse };
}

export const sendCompteConfirmationEmailContent = async ( client: any, urlVerification: string) => {
  const emailContent = {
    Messages: [
      {
        From: {
          Email: "nicolas@nataquashop.com",
          Name: "Nataqushop",
        },
        To: [
          {
            Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email ,
            Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
          },
        ],
        TemplateID: 6410284,
        TemplateLanguage: true,
        Subject: 'Confirmation de votre compte',
        Variables: {
          lien_de_verification_email: urlVerification
        }
      },
    ],
  };

  const emailResponse = await sendEmail(emailContent);
  if(emailResponse.error)
    console.error(emailResponse.error);
  return { success: true, emailResponse };
}

export const sendEmailConfirmationCommande = async ( client: any, commande: any, cmdAdresseFacturation: any, 
                                                      cmdAdresseLivraison: any, commande_lignes: any[]) => {
  const dureeLivraison = commande_lignes.map((ligne: any) => ligne.disponible ? '24h' : '10 jours').reduce((acc: string, curr: string) => acc === curr ? acc : '10 jours', '24h');
  const commandeLigneArray = commande_lignes.map((ligne: any) => {
        return {
            nom: ligne.intitule,
            prix_unit: ligne.prix_unitaire_ht + ligne.prix_unitaire_ht * (ligne.tva ? ligne.tva : 0) / 100,
            quantite: ligne.quantite,
            prix_total: ligne.prix_total_ttc
        };
  });

  const emailContent = {
      Messages: [
        {
          From: {
            Email: "nicolas@nataquashop.com",
            Name: "Nataqushop",
          },
          To: [
            {
              Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email,
              Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
            },
          ],
          TemplateID: 6406452,
          TemplateLanguage: true,
          Subject: "Confirmation de votre commande",
          Variables: {
            numero_commande: commande.data.id,
            date_commande: commande.data.date_creation,
            mode_paiement: commande.data.mode_paiement === 'CHEQUE' ? 'Chéque' : commande.data.mode_paiement === 'VIREMENT' ? 'Virement' : 'Carte Bancaire',
            commande_lignes: commandeLigneArray,
            frais_port: commande.data.frais_port,
            credit_utilise: commande.data.credit_utilise,
            total_commande: commande.data.montant,
            livreur: commande.data.mode_livraison,
            delai_livraison: dureeLivraison,
            adresse_facturation: `${cmdAdresseFacturation.data.prenom} ${cmdAdresseFacturation.data.nom} ${cmdAdresseFacturation.data.adresse} ${cmdAdresseFacturation.data.code_postal} ${cmdAdresseFacturation.data.ville} ${cmdAdresseFacturation.data.pays}`,
            adresse_livraison: cmdAdresseLivraison.data ? 
              `${cmdAdresseLivraison.data.prenom} ${cmdAdresseLivraison.data.nom} ${cmdAdresseLivraison.data.adresse} ${cmdAdresseLivraison.data.code_postal} ${cmdAdresseLivraison.data.ville} ${cmdAdresseLivraison.data.pays}` :
              `${cmdAdresseFacturation.data.prenom} ${cmdAdresseFacturation.data.nom} ${cmdAdresseFacturation.data.adresse} ${cmdAdresseFacturation.data.code_postal} ${cmdAdresseFacturation.data.ville} ${cmdAdresseFacturation.data.pays}`
          }
        },
      ],
  };

  const emailResponse = await sendEmail(emailContent);
  if(emailResponse.error)
    console.error(emailResponse.error);
  return { success: true, emailResponse };
}

export const sendCompteVerificationEmailContent = async ( client: any) => {
    const emailContent = {
      Messages: [
        {
          From: {
            Email: "nicolas@nataquashop.com",
            Name: "Nataqushop",
          },
          To: [
            {
              Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email ,
              Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
            },
          ],
          TemplateID: 6406448,
          TemplateLanguage: true,
          Subject: "Validation de compte",
          Variables: {}
        },
      ],
    };

    const emailResponse = await sendEmail(emailContent);
    if(emailResponse.error)
      console.error(emailResponse.error);
    return { success: true, emailResponse };
}

export const sendEmailCreationCashback = async (client: any, commande: any, cashback: any) => {
  const emailContentCashback = {
    Messages: [
          {
              From: {
                  Email: "nicolas@nataquashop.com",
                  Name: "Nataqushop",
              },
              To: [
                  {
                      Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email ,
                      Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
                  },
              ],
              TemplateID: 6406449,
              TemplateLanguage: true,
              Subject: "Confirmation de votre cashback",
              Variables: {
                  avoir_amount: cashback,
                  numero_commande: commande.data.id
              }
          }
      ]
  };

  const emailResponse =  await sendEmail(emailContentCashback);
  if(emailResponse.error)
    console.error(emailResponse.error);
  return { success: true, emailResponse };
}

export const sendEmailExpedition = async (expeditions: any, updateCommande: any[], commande_lignes: any) => {
    const email_content = {
      Messages: expeditions.data.map( (exp : any) => {
          const isExpeditionComplete = (updateCommande.find(uc => uc.id === exp.id_commande)?.statut ?? "") === "EXPEDIEE";
          const commandeLignes = commande_lignes.data.filter((ligne: any) => exp.expeditions_lignes.map((el : any) => el.id_modele).includes(ligne.id_modele));
          return {
              From: {
                  Email: "nicolas@nataquashop.com",
                  Name: "Nataqushop",
              },
              To: [
                  {
                      Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `technataqua+${exp.commandes.clients.numero_client}@gmail.com` : exp.commandes.clients.email,//"ahmed@squaad.io",
                      Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${exp.commandes.clients.numero_client}` : `${exp.commandes.clients.prenom} ${exp.commandes.clients.nom}`,
                  },
              ],
              TemplateID:  isExpeditionComplete ? 6426979 : 6406453,
              TemplateLanguage: true,
              Subject: "Expédition de votre commande",
              Variables: {
                  nom_client: exp.commandes.clients.nom,
                  numero_commande: exp.commandes.id,
                  prenom_client: exp.commandes.clients.prenom,
                  numero_colis: exp.num_suivis,
                  transporteur: exp.type,
                  adresse_livraison: `${exp.commandes.commande_adresses[0].adresse} ${exp.commandes.commande_adresses[0].code_postal} ${exp.commandes.commande_adresses[0].ville} ${exp.commandes.commande_adresses[0].pays}`,                    
                  url_suivi_colis: exp.type === "COLISSIMO" ? 
                      `https://www.laposte.fr/outils/suivre-vos-envois?code=${exp.num_suivis}` : 
                          exp.type === "MONDIAL_RELAY" ? 
                              `https://www.mondialrelay.fr/suivi-de-colis/?numero=${exp.num_suivis}` :
                                  exp.type === "CHRONOPOST" ? 
                                      `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${exp.num_suivis}` : 
                                          "",
                  produits: commandeLignes.map((ligne: any) => {
                      return {
                          nom: ligne.modeles.produits.produit_descriptions[0].titre,
                          quantite: ligne.quantite
                      }
                  })
              },
          };
      }) 
  };
  
  const emailResponse = await sendEmail(email_content);
  if(emailResponse.error) 
    console.error(emailResponse.error);
  return { success: true, emailResponse };
}

export const sendEmailRetourProduitValider = async (userClient: SupabaseClient, retour_id: string, bon_retour: string, client: any) => {
  const retour = await userClient.from('retours').select('*').eq('id', retour_id).single();
  if(retour.error) {
    console.error(retour.error);
  }

  const retour_lignes = await userClient.from('retours_lignes')
    .select('*')
    .eq('id_retour', retour.data.id);
  if(retour_lignes.error) {
    console.error(retour_lignes.error);
    return { success: false, error: { message: `${retour_lignes.error.message}` } };
  }

  const emailContent = {
    Messages: [
      {
        From: {
          Email: "nicolas@nataquashop.com",
          Name: "Nataqushop",
        },
        To: [
          {
            Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email ,
            Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
          },
        ],
        TemplateID: 6406451,
        TemplateLanguage: true,
        Subject: 'Validation de votre demande de retour',
        Variables: {
          numero_bon_retour: retour.data.num_suivi,
          // deno-lint-ignore no-explicit-any
          produits: retour_lignes.data.map((ligne: any) => ligne.intitule )
        },
        Attachments: [
          {
            ContentType: "application/pdf",
            Filename: `Bon_retour_${retour.data.num_suivi}.pdf`,
            Base64Content: bon_retour
          }
        ]
      },
    ],
  };

  const emailResponse = await sendEmail(emailContent);
  if(emailResponse.error)
    console.error(emailResponse.error);
  return { success: true, emailResponse };
}

export const sendEmailRetourProduitRecu = async(userClient: SupabaseClient, retour_id: string, client: any) => {
  const retour = await userClient.from('retours').select('*').eq('id', retour_id).single();
  if(retour.error) {
    console.error(retour.error);
    return;
  }
  const emailContent = {
      Messages: [
        {
          From: {
            Email: "nicolas@nataquashop.com",
            Name: "Nataqushop",
          },
          To: [
            {
              Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email ,
              Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
            },
          ],
          TemplateID: 6406450,
          TemplateLanguage: true,
          Subject: 'Retour reçu',
          Variables: {
            numero_bon_retour: retour.data.numero_suivi || "N/A",
            delai_expedition: "10",
            numro_service_client: "06 12 34 56 78"
          }
        },
      ],
    };

    const emailResponse = await sendEmail(emailContent);
    if(emailResponse.error) {
      console.error(emailResponse.error);
    }
    return { success: true, emailResponse };
}

export const sendEmailAvoirsCreation = async (userClient: SupabaseClient, avoir_id: number, client: any) => {
  const avoir = await userClient.from('avoirs').select('*').eq('id', avoir_id).single();
  if(avoir.error) {
    console.error(avoir.error);
    return;
  }

  const emailContent = {
    Messages: [
      {
        From: {
          Email: "nicolas@nataquashop.com",
          Name: "Nataqushop",
        },
        To: [
          {
            Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email ,
            Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
          },
        ],
        TemplateID: 6406449,
        TemplateLanguage: true,
        Subject: 'Création de votre avoir',
        Variables: {
          avoir_amount: avoir.data.total,
          numero_commande: avoir.data.id_commande
        }
      },
    ],
  };

  const emailResponse = await sendEmail(emailContent);
  if(emailResponse.error)
    console.error(emailResponse.error);
  return { success: true, emailResponse };
}

export const sendEmailRetraction = async (produits: string[], client: any) => {
  const emailContent = {
    Messages: [
      {
        From: {
          Email: "nicolas@nataquashop.com",
          Name: "Nataqushop",
        },
        To: [
          {
            Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email ,
            Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
          },
        ],
        TemplateID: 6410285,
        TemplateLanguage: true,
        Subject: 'Prise en compte de la demande de rétractation',
        Variables: {
          produits: produits
        }
      },
    ],
  };

  const emailResponse = await sendEmail(emailContent);
  if(emailResponse.error)
    console.error(emailResponse.error);
  return { success: true, emailResponse };
}

export const sendEmailModeleDisponible = async ( userClient: SupabaseClient, idNotification: number ) => {
  const alertes_rupture = await userClient.from('alertes_rupture')
    .select('*, modeles!inner(*, stocks(*), produits!inner(*, produit_descriptions!inner(*), produit_images!inner(*)))')
    .eq('id', idNotification)
    .eq('modeles.produits.produit_descriptions.lang', 'fr')
    .gte('modeles.stocks.disponible', 0)
    .single();

  if(alertes_rupture.error) {
    console.error(alertes_rupture.error);
    return { success: false, error: alertes_rupture.error };
  }

  let emailDestinataire = "";
  let nomDestinataire = "";
  try {
    const client = await userClient.from('clients')
      .select('*')
      .eq('numero_client', alertes_rupture.data.numero_client)
      .single();

    if(client.error || !client.data || isNaN(parseInt(client.data.numero_client))) {
      throw new Error('1 Client not found');
    }    

    emailDestinataire = ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email;
    nomDestinataire = ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
  } catch(e) {
    if(!alertes_rupture.data.email)
      throw new Error(`2 Client not found`);

    emailDestinataire = alertes_rupture.data.email;
    nomDestinataire = "Client";
  }

  const emailContent = {
    Messages: [
      {
        From: {
          Email: "nicolas@nataquashop.com",
          Name: "Nataqushop",
        },
        To: [
          {
            Email: emailDestinataire,
            Name: nomDestinataire
          },
        ],
        TemplateID: 6476844,
        TemplateLanguage: true,
        Subject: 'Bonne nouvelle, votre article est de nouveau disponible ! 🤩',
        Variables: {
          url_image_produit: `https://supabase.nataquashop.com/storage/v1/object/public/${alertes_rupture.data.modeles.produits.produit_images[0].url}`,
          nom_produit: alertes_rupture.data.modeles.produits.produit_descriptions[0].titre
        }
      }
    ]
  }

  const emailResponse = await sendEmail(emailContent);
  if(emailResponse.error)
    console.error(emailResponse.error);
  
  const updateAlert = {
    id: alertes_rupture.data.id,
    email_envoye: true
  };  
  const updateResponse = await userClient.from('alertes_rupture')
    .upsert(updateAlert);
  if(updateResponse.error) {
    console.error(updateResponse.error);
    return { success: false, error: updateResponse.error };
  }

  return { success: true, emailResponse };
}

export const sendEmailRetourProduitRefuser = async (userClient: SupabaseClient, retourId: number, numero_commande: number, client: any) => {
  const retour_lignes = await userClient.from('retours_lignes')
    .select('*')
    .eq('id_retour', retourId);
  if(retour_lignes.error) {
    console.error(retour_lignes.error);
    return { error: retour_lignes.error };
  }

  const emailContent = {
    Messages: [
      {
        From: {
          Email: "nicolas@nataquashop.com",
          Name: "Nataqushop",
        },
        To: [
          {
            Email: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Team+${client.data.numero_client}@squaad.io` : client.data.email ,
            Name: ("true" == Deno.env.get('DEBUG_EMAIL')!) ? `Client_${client.data.numero_client}` : `${client.data.prenom} ${client.data.nom}`
          },
        ],
        TemplateID: 6477436,
        TemplateLanguage: true,
        Subject: `Retour produits non validé - [Numéro de commande : ${numero_commande}]`,
        Variables: {
          nom_client: client.data.nom,
          prenom_client: client.data.prenom,
          numero_service_client: "06 12 34 56 78",
          numero_commande: numero_commande,
          produits: retour_lignes.data.map((ligne: any) => ligne.intitule)
        }
      },
    ],
  };

  const emailResponse = await sendEmail(emailContent);
  if(emailResponse.error)
    console.error(emailResponse.error);
  return { success: true, emailResponse };
}

export const mailDispatcher : Record<EmailType, Function> = {
  [EmailType.EMAIL_COMPTE_CONFIRMATION]: sendCompteConfirmationEmailContent,
  [EmailType.EMAIL_COMPTE_VERIFICATION]: sendCompteVerificationEmailContent,
  [EmailType.EMAIL_COMMANDE_CONFIRMATION]: sendEmailConfirmationCommande,
  [EmailType.EMAIL_PREPARATION_COMMANDE]: sendEmailConfirmationCommande,
  [EmailType.EMAIL_EXPEDITION]: sendEmailExpedition,
  [EmailType.EMAIL_DEMANDE_RETOUR_VALIDATION]: sendEmailRetourProduitValider,
  [EmailType.EMAIL_RETOUR_RECU]: sendEmailRetourProduitRecu,
  [EmailType.EMAIL_AVOIR_CREATION]: sendEmailAvoirsCreation,
  [EmailType.EMAIL_CONFIRMATION_RETRACTION]: sendEmailRetraction,
  [EmailType.EMAIL_ENVOYER_CHEQUE_CADEAU]: sendEmailChequeCadeau,
  [EmailType.EMAIL_DEMANDE_AVIS]: sendEmailDemandeAvis,
  [EmailType.EMAIL_CREATE_CASHBACK]: sendEmailCreationCashback,
  [EmailType.EMAIL_DEMANDE_DEVIS]: sendEmailDemandeDevis,
  [EmailType.EMAIL_Modele_DISPONIBLE]: sendEmailModeleDisponible,
  [EmailType.EMAIL_DEMANDE_RETOUR_REFUSE]: sendEmailRetourProduitRefuser
}