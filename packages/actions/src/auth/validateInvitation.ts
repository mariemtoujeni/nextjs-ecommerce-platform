"use server"

import { ValidateInvitation, ValidateInvitationSchema } from "@repo/core/models";
import { validateInvitationUseCase } from "@repo/core/usecases";

export const validateInvitationAction = async (validateInvitation: ValidateInvitation) => {
    try {
        const validatedFields = ValidateInvitationSchema.safeParse(validateInvitation);
        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.message
            };
        }

        await validateInvitationUseCase(validateInvitation);
        return {
            success: true
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}
