"use server"

import { updateAttributeUseCase } from "@repo/core/usecases";
import { AttributDetail, UpdateAttributDetailRequest } from "@repo/core/models";
import { ReturnOne } from "@repo/core/types";

export const updateAttributeAction = async (id: number, attribute: UpdateAttributDetailRequest) : Promise<ReturnOne<AttributDetail>> => {
    try {
        const updatedAttribute = await updateAttributeUseCase(id, attribute);
        return {
            item: updatedAttribute,
            error: undefined
        };
    } catch (error: any) {
        return {
            item: null as unknown as AttributDetail,
            error: error.message || "Une erreur est survenue lors de la mise à jour de l'attribut",
        };
    }
}