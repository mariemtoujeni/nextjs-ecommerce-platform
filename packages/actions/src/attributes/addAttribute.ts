"use server"

import { createAttributeUseCase } from "@repo/core/usecases";
import { Attribut, CreateAttributDetailRequest, CreateAttributeRequest } from "@repo/core/models";

export const addAttributeAction = async (attribute: CreateAttributDetailRequest): Promise<Attribut> => {    
    const createdAttribute = await createAttributeUseCase(attribute);
    return createdAttribute;
}