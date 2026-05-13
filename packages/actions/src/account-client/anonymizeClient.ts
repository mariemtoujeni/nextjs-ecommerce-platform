"use server"

import { Client } from "@repo/core/models"
import { ReturnOne } from "@repo/core/types"
import { anonymizeClientDataUseCase } from "@repo/core/usecases"

export const anonymizeClientAction = async():Promise<ReturnOne<Client>>=>{
    try{
        const anonymizeData = await anonymizeClientDataUseCase()
        return {
            item: anonymizeData
        };
    }catch(error: any){
        console.error("Failed to anonymize client",error)
        return {
            item: {} as Client,
            error: error
        }

    }
}