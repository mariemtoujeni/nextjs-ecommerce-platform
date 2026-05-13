"use server"

import { deleteAdressClientUseCase } from "@repo/core/usecases"

export const deleteAdressClientAction = async (id: number): Promise<void> => {
    try{
        await deleteAdressClientUseCase(id)
    } catch(error){
        console.error("Failed to delete adress client",error)
    }
}