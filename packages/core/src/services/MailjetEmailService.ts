import { ErrorCodes } from "../types/error";
import { BodyResponse } from "../types/utils";
import { IEmailService } from "./IEmailService";
import { CreditNotePresenter, GiftCardPresenter, Opinion, ProductAlert, Quotation, ReturnPresenter } from "../models";
import { getInjection } from "../types";

export class MailjetEmailService implements IEmailService {

  private readonly mailjetUrl = "https://api.mailjet.com/v3.1/send";
  private readonly apiKey = process.env.MJ_API_KEY! || "d5b85c0267fd2790c0ca4a9d07ea8f1f";
  private readonly apiSecret = process.env.MJ_API_SECRET! || "990ee4aa66262b62083fac23181550bc";
  private readonly fromEmail = process.env.MJ_FROM_EMAIL! || "nicolas@nataquashop.com";
  private readonly fromName = process.env.MJ_FROM_NAME! || "Nataquashop";

  private async sendEmail(emailContent: any): Promise<BodyResponse> {
    const response: BodyResponse = { success: true };
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");

    try {
      const responseEmail = await fetch(this.mailjetUrl, {
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
      } else {
        const errorText = await responseEmail.text();
        response.success = false;
        response.code = ErrorCodes.EMAIL_IMPOSSIBLE;
        response.message = errorText;
      }
    } catch (error) {
      response.success = false;
      response.code = ErrorCodes.EMAIL_IMPOSSIBLE;
      response.message = `Unexpected error: ${(error as Error).message}`;
    }

    return response;
  }

  async sendRetourEnStockEmail(productAlert: ProductAlert): Promise<BodyResponse> {
    const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: this.fromEmail,
          Name: this.fromName
        },
        To: [{
          Email: DEBUG_EMAIL !== 'integration' ? productAlert.email : `team@squaad.io`,//`technataqua+${productAlert.clientNumber}@gmail.com`,
          Name: DEBUG_EMAIL !== 'integration' ? `${productAlert.client?.firstName} ${productAlert.client?.lastName}` : `Client_Squaad`
        }],
        TemplateLanguage: true,
        Subject: "📦 Le produit que vous attendiez est de retour ! En Stock",
        TemplateID: 6437008,
        //Variables: {productAlert}
      }]
    };

    const response = await this.sendEmail(mailjetPayload);
    if (response.success) {
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  }

  async sendReturnRequestReceivedEmail(retour: ReturnPresenter, bon_retour: string): Promise<BodyResponse> {
    const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: this.fromEmail,
          Name: this.fromName
        },
        To: [{
          Email: DEBUG_EMAIL !== 'integration' ? retour.client.email : `team@squaad.io`,//`technataqua+${retour.client.clientNumber}@gmail.com`,
          Name: DEBUG_EMAIL !== 'integration' ? `${retour.client.firstName} ${retour.client.lastName}` : `Client_Squaad`
        }],
        TemplateID: 6406451,
        TemplateLanguage: true,
        Subject: "📦 Validation de votre demande de retour",
        Variables: {
          numero_bon_retour: retour.trackingNumber,
          produits: retour.lines.map((line) => line.name)
        },
        Attachments: [
          {
            ContentType: "application/pdf",
            Filename: `Bon_retour_${retour.trackingNumber}.pdf`,
            Base64Content: bon_retour
          }
        ]
      }]
    };

    const response = await this.sendEmail(mailjetPayload);
    if (response.success) {
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  }

  async sendReturnReceivedEmail(retour: ReturnPresenter): Promise<BodyResponse> {
    const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: this.fromEmail,
          Name: this.fromName
        },
        To: [{
          Email: DEBUG_EMAIL !== 'integration' ? retour.client.email : `team@squaad.io`,//`technataqua+${retour.client.clientNumber}@gmail.com`,
          Name: DEBUG_EMAIL !== 'integration' ? `${retour.client.firstName} ${retour.client.lastName}` : `Client_Squaad`
        }],
        TemplateID: 6406450,
        TemplateLanguage: true,
        Subject: "📦 Retour reçu",
        Variables: {
          numero_bon_retour: retour.trackingNumber || "N/A",
          delai_expedition: "10",
          numro_service_client: "06 12 34 56 78"
        },
      }]
    };

    const response = await this.sendEmail(mailjetPayload);
    if (response.success) {
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  }

  async sendCreditNoteCreationEmail(creditNote: CreditNotePresenter): Promise<BodyResponse> {
    const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: this.fromEmail,
          Name: this.fromName
        },
        To: [{
          Email: DEBUG_EMAIL !== 'integration' ? creditNote.client.email : `team@squaad.io`,//`technataqua+${creditNote.client.clientNumber}@gmail.com`,
          Name: DEBUG_EMAIL !== 'integration' ? `${creditNote.client.firstName} ${creditNote.client.lastName}` : `Client_Squaad`
        }],
        TemplateID: 6406449,
        TemplateLanguage: true,
        Subject: "💳 Création de votre avoir",
        Variables: {
          avoir_amount: creditNote.total,
          numero_commande: creditNote.orderId
        }
      }]
    };

    const response = await this.sendEmail(mailjetPayload);
    if (response.success) {
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  }

  async sendGiftCardEmail(giftCard: GiftCardPresenter): Promise<BodyResponse> {
    const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: this.fromEmail,
          Name: this.fromName
        },
        To: [{
          Email: DEBUG_EMAIL !== 'integration' ? giftCard.client.email : `team@squaad.io`,//`technataqua+${giftCard.client.clientNumber}@gmail.com`,
          Name: DEBUG_EMAIL !== 'integration' ? `${giftCard.client.firstName} ${giftCard.client.lastName}` : `Client_Squaad`
        }],
        TemplateID: 6417627,
        TemplateLanguage: true,
        Subject: "💳 Confirmation de votre commande de chèque cadeau",
        Variables: {
          code_cheque_cadeau: giftCard.code,
          montant_cheque_cadeau: giftCard.value
        }
      }]
    };

    const response = await this.sendEmail(mailjetPayload);
    if (response.success) {
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  }

  async sendCashbackCreationEmail(cashback: CreditNotePresenter): Promise<BodyResponse> {
    const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: this.fromEmail,
          Name: this.fromName
        },
        To: [{
          Email: DEBUG_EMAIL !== 'integration' ? cashback.client.email : `team@squaad.io`,//`technataqua+${cashback.client.clientNumber}@gmail.com`,
          Name: DEBUG_EMAIL !== 'integration' ? `${cashback.client.firstName} ${cashback.client.lastName}` : `Client_Squaad`
        }],
        TemplateID: 6406449,
        TemplateLanguage: true,
        Subject: "💳 Création de votre cashback",
        Variables: {
          avoir_amount: cashback.total,
          numero_commande: cashback.orderId
        }
      }]
    };

    const response = await this.sendEmail(mailjetPayload);
    if (response.success) {
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  }

  async sendRefusRetourEmail(retour: ReturnPresenter): Promise<BodyResponse> {
    const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: this.fromEmail,
          Name: this.fromName
        },
        To: [{
          Email: DEBUG_EMAIL !== 'integration' ? retour.client.email : `team@squaad.io`,//`technataqua+${retour.client.clientNumber}@gmail.com`,
          Name: DEBUG_EMAIL !== 'integration' ? `${retour.client.firstName} ${retour.client.lastName}` : `Client_${retour.client ? retour.client.clientNumber : retour.order?.client?.clientNumber}`
        }],
        TemplateID: 6477436,
        TemplateLanguage: true,
        Subject: `❌ Retour produits non validé - [Numéro de commande : ${retour.orderId}]`,
        Variables: {
          nom_client: retour.order?.client.lastName,
          prenom_client: retour.order?.client.firstName,
          numero_service_client: "06 12 34 56 78",
          numero_commande: retour.orderId,
          produits: retour.lines.map((line) => line.name)
        }
      }]
    };

    const response = await this.sendEmail(mailjetPayload);
    if (response.success) {
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  }

  async sendOpinionEmail(opinion: Opinion): Promise<BodyResponse> {
    throw new Error("Not implemented");
  }

  async sendQuotationEmail(quotation: Quotation): Promise<BodyResponse> {
    const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: this.fromEmail,
          Name: this.fromName
        },
        To: [{
          Email: DEBUG_EMAIL !== 'integration' ? quotation.client?.email : `team@squaad.io`,//`technataqua+${quotation.client?.clientNumber}@gmail.com`,
          Name: DEBUG_EMAIL !== 'integration' ? `${quotation.client?.firstName} ${quotation.client?.lastName}` : `Client_Squaad`
        }],
        TemplateID: 6449479,
        TemplateLanguage: true,
        Subject: "📄 Devis disponible dans votre espace Club",
        Variables: {
          produits: quotation.products?.map((product) => product.name),
          intitule_devis: quotation.title
        }
      }]
    };

    const response = await this.sendEmail(mailjetPayload);
    if (response.success) {
      return { success: true, message: response.message };
    }
    return { success: false, message: response.message };
  }

  async sendInvitationEmail(email: string, lien_de_connexion: string): Promise<BodyResponse> {
    const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: this.fromEmail,
          Name: this.fromName
        },
        To: [{
          Email: DEBUG_EMAIL !== 'integration' ? email : `team@squaad.io`,
          Name: DEBUG_EMAIL !== 'integration' ? `Client_Squaad` : `Client_Squaad`
        }],
        TemplateID: 7301353, 
        TemplateLanguage: true,
        Subject: "📧 Invitation à rejoindre l'espace Club",
        Variables: {
          lien_de_connexion: DEBUG_EMAIL !== 'integration' ? `https://dev.admin.nataquashop.com/sign-in?code=${lien_de_connexion}` : `http://localhost:3000/sign-in?code=${lien_de_connexion}`
        }
      }]
    };

    const response = await this.sendEmail(mailjetPayload);
    if(response.success) {
      return { success: true, message: response.message };
    }
    return {success: false, message: response.message};
  }

 async sendResetPasswordEmail(email: string, prenom: string, nom_de_site: string, lien_de_connexion: string): Promise<BodyResponse> {
    const DEBUG_EMAIL = process.env.DEBUG_EMAIL || 'integration';
    const mailjetPayload = {
      Messages: [{
        From: {
          Email: this.fromEmail,
          Name: this.fromName
        },
        To: [{
          Email: email,
          Name: DEBUG_EMAIL !== 'integration' ? `Client_Squaad` : `Client_Squaad`
        }],
        TemplateID: 7301406,
        TemplateLanguage: true,
        Subject: "📧 Réinitialisation de votre mot de passe",
        Variables: {
          lien_de_connexion: `https://dev.nataquashop.com/${lien_de_connexion}`,
          prenom: prenom,
          nom_de_site: nom_de_site
        }
      }]
    };

    const response = await this.sendEmail(mailjetPayload);
    if(response.success) {
      return { success: true, message: response.message };
    }
    return {success: false, message: response.message};
  }

}