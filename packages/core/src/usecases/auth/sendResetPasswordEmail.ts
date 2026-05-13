import { getInjection } from "../../types";

type ResetPasswordResult = {
    success: boolean;
    userExists: boolean;
    message?: string;
}

export const sendResetPasswordEmailUseCase = async (userEmail: string): Promise<ResetPasswordResult> => {

    const userRepo = await getInjection("IUserRepository");
    const resetData = await userRepo.generateResetPasswordLink(userEmail);
    
    
     if (!resetData) {
    return {
      success: false,
      userExists: false,
      message: "Aucun utilisateur trouvé avec cet email",
    };
  }
    
    const emailService = await getInjection("IEmailService");
    const emailResponse = await emailService.sendResetPasswordEmail(userEmail, resetData.prenom, resetData.site, resetData.lien_de_connexion);
    return {
        success: emailResponse.success,
        userExists: true,
        message: emailResponse.message
            ? "Email envoyé avec succès"
            : "Erreur lors de l'envoi du mail",
    }

}