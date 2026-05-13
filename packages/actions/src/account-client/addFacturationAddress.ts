"use server"

import { Address, FactAddressInput } from "@repo/core/models"
import { ReturnOne } from "@repo/core/types";
import { addFcaturationAddressUseCase } from "@repo/core/usecases"

export const addFactAddressAction = async (address: FactAddressInput):Promise<ReturnOne<Address>>=>{
    try{
        const addAddress = await addFcaturationAddressUseCase(address);
        
        return {
            item: addAddress
        };
        
    }catch(error){
        console.error("Failed to add Address")
        throw {
            item: {} as Address,
            error: error
        };
    }

}