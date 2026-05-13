'use server';

import { ReturnPresenter } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { getCreditNoteByCommandIdUseCase, getReturnUseCase } from "@repo/core/usecases";

export const getReturnAction = async (id: number) : Promise<ReturnOne<ReturnPresenter>> => {
    try {
        const returnData = await getReturnUseCase(id);
        if(returnData.error) {
            throw new Error(returnData.error);
        }
        if(returnData.item) {
            try {
                const creditNote = await getCreditNoteByCommandIdUseCase(returnData.item.orderId);
                if(creditNote.item) {
                    returnData.item.creditNote = creditNote.item;
                }
            } catch (error: any) {
                console.error(error.message);
            }            
        }        
        return returnData;
    } catch (error: any) {
        return {
            item: null as unknown as ReturnPresenter,
            error: error.message || "Une erreur est survenue lors de la récupération du retour",
        };
    }
}