"use server";

import { ReturnOne } from "@repo/core/types";
import { ValidatePaymentUseCase } from "@repo/core/usecases";

export async function validatePayment(method: string, payload?: any): Promise<ReturnOne<number>> {
  try {
    if (method === 'VIREMENT') {
      const resultVB = await ValidatePaymentUseCase("VIREMENT");
      return {
        item: resultVB
      }
    } else {
      const resultCB = await ValidatePaymentUseCase("SYSTEMPAY", payload);
      return {
        item: resultCB
      }
    }
  } catch (error: any) {
    console.error("Failed to validate payment:", error);
    return {
      item: 0,
      error: error
    };
  }
}
