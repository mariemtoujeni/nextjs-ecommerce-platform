"use server"

import { passwordClientInput } from "@repo/core/models"
import { updatePasswordClientUseCase } from "@repo/core/usecases"

export const updatePasswordClientAction = async (newPasswordClient: passwordClientInput): Promise<void> => {
    try{
        await updatePasswordClientUseCase(newPasswordClient)
    }catch(error){
        console.error("Failed to update password client",error)
    }
}
