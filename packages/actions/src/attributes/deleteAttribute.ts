"use server"

import { deleteAttributeUseCase } from "@repo/core/usecases";
import { UpdateAttributDetailRequest } from "@repo/core/models";

export const deleteAttributeAction = async (attribute: UpdateAttributDetailRequest) => {
    await deleteAttributeUseCase(attribute);
}