import { IEmailService } from "../../services";
import { ProductAlert, ReturnPresenter, CreditNotePresenter, GiftCardPresenter, Opinion, Quotation } from "../../models";
import { BodyResponse } from "../../types/utils";

export class MockEmailService implements IEmailService { 
  
  async sendRetourEnStockEmail(productAlert: ProductAlert): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Product alert request email sent for ${productAlert.email}`
    };
  }

  async sendReturnRequestReceivedEmail(retour: ReturnPresenter, bon_retour: string): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Return request received email sent for ${retour.client.email}`
    };
  }

  async sendReturnReceivedEmail(retour: ReturnPresenter): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Return received email sent for ${retour.client.email}`
    };
  }

  async sendCreditNoteCreationEmail(creditNote: CreditNotePresenter): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Credit note creation email sent for ${creditNote.client.email}`
    };
  }

  async sendGiftCardEmail(giftCard: GiftCardPresenter): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Gift card email sent for ${giftCard.client.email}`
    };
  }

  async sendOpinionEmail(opinion: Opinion): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Opinion email sent for ${opinion.email}`
    };
  }

  async sendCashbackCreationEmail(cashback: CreditNotePresenter): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Cashback creation email sent for ${cashback.client.email}`
    };
  }

  async sendQuotationEmail(quotation: Quotation): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Quotation email sent for ${quotation.client?.email}`
    };
  }

  async sendRefusRetourEmail(retour: ReturnPresenter): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Return refusal email sent for ${retour.client.email}`
    };
  }

  async sendInvitationEmail(email: string, lien_de_connexion: string): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Invitation email sent for ${email}`
    };
  }
  

  async sendResetPasswordEmail(email: string, prenom: string, nom_de_site: string, lien_de_connexion: string): Promise<BodyResponse> {
    return {
      success: true,
      message: `Mocked: Reset password email sent for ${email}`
    };
  }
}
