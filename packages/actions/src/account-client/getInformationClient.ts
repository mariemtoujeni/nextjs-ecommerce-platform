"use server"
import { Client } from "@repo/core/models"
import { ReturnOne } from "@repo/core/types";
import { getClientInformationsUseCase } from "@repo/core/usecases";

export const getInformationClientAction = async ():Promise<ReturnOne<Client>>=>{
    try {
       
    const information = await getClientInformationsUseCase();
    return {
        item: information
    };}
    catch (error: any) {
        console.error("Error fetching client information:", error);
        return {
            item: {} as Client,
            error: error
        }
    }
}