"use server"

import { Opinion, opinionInput } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { addOpinionClientUseCase } from "@repo/core/usecases";

export const addOpinionClientAction = async (input: opinionInput):Promise<ReturnOne<Opinion>>=>{
    try{
        const addOpinion = await addOpinionClientUseCase(input);
        
        return {
            item: addOpinion
        };
        
    }catch(error: any){
        console.error("Failed to add opinion")
        return {
            item: {} as Opinion,
            error: error
        }
    }

}