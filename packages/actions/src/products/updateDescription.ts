"use server"

import { ProductDescriptionUpdate } from "@repo/core/models";
import { updateDescriptionUseCase } from "@repo/core/usecases";

export const updateDescriptionAction = async (id: number, description: ProductDescriptionUpdate) => {
    try {
        await updateDescriptionUseCase(id, description);

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}