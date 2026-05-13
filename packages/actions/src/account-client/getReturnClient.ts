"use server"

import { Return } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { getClientReturnsUseCase } from "@repo/core/usecases";

export const getReturnClientAction = async ():Promise<ReturnAll<Return>>=>{
   try {
       const returns = await getClientReturnsUseCase();
      return {
          items: returns,
          count: returns.length,
          total: returns.length,
      }

   } catch (error: any) {
         console.error("Error fetching client returns:", error);
      return {
          items: [],
          count: 0,
          total: 0,
          error: error
      }
   }
}