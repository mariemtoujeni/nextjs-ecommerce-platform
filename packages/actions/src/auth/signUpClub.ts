"use server"

import { SignUpClub } from "@repo/core/models"
import { signUpClubUseCase } from "@repo/core/usecases"

export const signUpClubAction = async (user: SignUpClub):Promise<boolean> => {
   
   try {
        const success = await signUpClubUseCase(user);
         return success;
   } catch (error) {
    return false;
   }        
   
}