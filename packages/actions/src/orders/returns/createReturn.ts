'use server';

import { ReturnPresenter, ReturnPresenterInput } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { createReturnUseCase } from "@repo/core/usecases";

export const createReturnAction = async (returnData: ReturnPresenterInput) : Promise<ReturnOne<ReturnPresenter>> => {
    try {
        const returnOne = await createReturnUseCase(returnData);
        if(returnOne.error) {
            throw new Error(returnOne.error);
        }
        return returnOne;
    } catch (error: any) {
        return {
            item: null as unknown as ReturnPresenter,
            error: error.message || "Une erreur est survenue lors de la création du retour",
        };
    }
}