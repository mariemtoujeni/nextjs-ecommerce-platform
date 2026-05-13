import { CreditNotePresenter, GiftCardPresenter, Opinion, ProductAlert, Quotation, ReturnPresenter } from "../models";
import { BodyResponse } from  "../types";
export interface IEmailService {
  //TODO: sendCompteConfirmationEmail(client: Client): Promise<BodyResponse>; // EmailType.EMAIL_COMPTE_CONFIRMATION
  //TODO: sendCompteVerificationEmail(client: Client): Promise<BodyResponse>; // EmailType.EMAIL_COMPTE_VERIFICATION
  //TODO: sendCommandeConfirmationEmail(commande: Commande): Promise<BodyResponse>; // EmailType.EMAIL_COMMANDE_CONFIRMATION
  //TODO: sendConfirmationCommandeEmail(commande: Commande): Promise<BodyResponse>; // EmailType.EMAIL_PREPARATION_COMMANDE
  //TODO: sendExpeditionEmail(expedition: Expedition): Promise<BodyResponse>; // EmailType.EMAIL_EXPEDITION
  sendReturnRequestReceivedEmail(retour: ReturnPresenter, bon_retour: string): Promise<BodyResponse>; // EmailType.EMAIL_DEMANDE_RETOUR_VALIDATION
  sendReturnReceivedEmail(retour: ReturnPresenter): Promise<BodyResponse>; // EmailType.EMAIL_RETOUR_RECU
  sendCreditNoteCreationEmail(creditNote: CreditNotePresenter): Promise<BodyResponse>; // EmailType.EMAIL_AVOIR_CREATION
  //TODO: sendRetractionRequestReceivedEmail(retraction: Retraction): Promise<BodyResponse>; // EmailType.EMAIL_CONFIRMATION_RETRACTION
  sendGiftCardEmail(giftCard: GiftCardPresenter): Promise<BodyResponse>; // EmailType.EMAIL_ENVOYER_CHEQUE_CADEAU
  sendOpinionEmail(opinion: Opinion): Promise<BodyResponse>; // EmailType.EMAIL_DEMANDE_AVIS
  sendCashbackCreationEmail(cashback: CreditNotePresenter): Promise<BodyResponse>; // EmailType.EMAIL_CREATE_CASHBACK
  sendQuotationEmail(quotation: Quotation): Promise<BodyResponse>; // EmailType.EMAIL_DEMANDE_DEVIS
  sendRetourEnStockEmail(productAlert: ProductAlert): Promise<BodyResponse>; // EmailType.EMAIL_Modele_DISPONIBLE
  sendRefusRetourEmail(retour: ReturnPresenter): Promise<BodyResponse>; // EmailType.EMAIL_DEMANDE_RETOUR_REFUSE
  sendInvitationEmail(email: string, lien_de_connexion: string): Promise<BodyResponse>; // EmailType.EMAIL_INVITATION
  sendResetPasswordEmail(email: string, prenom: string, nom_de_site: string, lien_de_connexion: string): Promise<BodyResponse>; // EmailType.EMAIL_RESET_PASSWORD
}
