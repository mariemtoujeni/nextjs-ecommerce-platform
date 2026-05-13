"use server"
import { sendResetPasswordEmailUseCase } from "@repo/core/usecases";
type ResetPasswordResult = {
    success: boolean;
    userExists: boolean;
    message?: string;
}

export const sendEmailAction = async (userEmail: string): Promise<ResetPasswordResult> => {
    try {
        const result = await sendResetPasswordEmailUseCase(userEmail);
        return {
            success: result.success,
            userExists: result.userExists,
            message: result.message
                ? "Email envoyé avec succès"
                : "Erreur lors de l'envoi du mail",

        };
    } catch(error) {
          return {
            success: false,
            userExists: false,
            message: "Erreur lors de l'envoi du mail",

        };      
    }

}