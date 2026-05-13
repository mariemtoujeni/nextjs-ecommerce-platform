'use server';

import { CreditNote, CreditNoteInput } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { createCreditNoteUseCase } from "@repo/core/usecases";

export const createCreditNoteAction = async (creditNoteInput: CreditNoteInput) : Promise<ReturnOne<CreditNote>> => {
    try {
        return await createCreditNoteUseCase(creditNoteInput);
    } catch (error: any) {
        return {
            item: null as unknown as CreditNote,
            error: error.message || "Une erreur est survenue lors de la création de l'avoir"
        };
    }
}