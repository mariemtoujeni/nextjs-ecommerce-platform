"use server"

import { CreditNote } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";
import { getClientCreditNotesUseCase } from "@repo/core/usecases";

export const getCreditNoteAction = async ():Promise<ReturnAll<CreditNote>>=>{
    try{
        const creditNotes = await getClientCreditNotesUseCase();
        return {
            items: creditNotes,
            count: creditNotes.length,
            total: creditNotes.length
        };
    }catch(error: any){
        console.error("Error fetching client returns:", error);
       return {
        items: [],
        count: 0,
        total: 0,
        error: error
       }
    }

}