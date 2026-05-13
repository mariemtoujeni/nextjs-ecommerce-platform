"use server"

import { SignUpPayload } from "@repo/core/models"
import { signUpUseCase } from "@repo/core/usecases"

export const signUpAction = async ( user: SignUpPayload ): Promise<{ success: boolean; error?: string }> => {
  try {
    return await signUpUseCase(user);
  } catch (error: any) {    
    return { success: false };
  }
};
