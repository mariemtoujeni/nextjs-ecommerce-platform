"use server"

import { Client, dataClientInput } from "@repo/core/models"
import { ReturnOne } from "@repo/core/types"
import { updateClientInformationsUseCase } from "@repo/core/usecases"

export const updateInformationClientAction = async (newClientInformations: dataClientInput):Promise<ReturnOne<Client>>=>{
   
    try{
        const updateData = await updateClientInformationsUseCase(newClientInformations)
        return {
            item: updateData
        };
    }catch(error: any){
        console.error("Failed to update information client",error)
        return {
            item: {} as Client,
            error: error
        };
    }

}