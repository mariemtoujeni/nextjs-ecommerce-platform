"use server"

import { InfoProductByOrder } from "@repo/core/models"
import { ReturnAll } from "@repo/core/types";
import { getTitleProductByOrderUseCase } from "@repo/core/usecases";

export const getTitleProductByOrderAction = async (commandId: number):Promise<ReturnAll<InfoProductByOrder>>=>{
     try {
           const returns = await getTitleProductByOrderUseCase(commandId);
            return {
                  items: returns,
                  count: returns.length,
                  total: returns.length,
            }
    
       } catch (error: any) {
             console.error("Error fetching title product:", error);
            return {
                  items: [],
                  count: 0,
                  total: 0,
                  error: error
            }
       }

}