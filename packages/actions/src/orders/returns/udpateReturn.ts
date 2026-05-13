'use server';

import { ReturnPresenter, ReturnPresenterInput } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";
import { updateReturnUseCase } from "@repo/core/usecases";

export const updateReturnAction = async (id: number, returnData: ReturnPresenterInput) : Promise<ReturnOne<ReturnPresenter>> => {
    try {
        const updatedReturn = await updateReturnUseCase(id, returnData);
        return updatedReturn;
    } catch (error: any) {
        return {
            item: null as unknown as ReturnPresenter,
            error: error.message || "Une erreur est survenue lors de la mise à jour du retour"
        };
    }
};
