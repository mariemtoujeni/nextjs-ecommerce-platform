"use server"

import { ResetPasswordResult } from "@repo/core/types";
import { resetPasswordUseCase } from "@repo/core/usecases"

export const resetPasswordAction = async (newPassword:string, token: string): Promise<ResetPasswordResult> => {
   try {
      const result = await resetPasswordUseCase(newPassword, token);
      return result;
   } catch(error: any) {
      return {
         success: false,
         error: "Unexpected error"
      };
   }

}