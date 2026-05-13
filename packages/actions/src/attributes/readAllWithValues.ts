"use server"

import { readAllAttributesWithValuesUseCase } from "@repo/core/usecases";
import { AttributWithValues } from "@repo/core/models";
import { ReturnAll } from "@repo/core/types";

export const getAllAttributesWithValuesAction = async (): Promise<ReturnAll<AttributWithValues>> => {
    try {
        const attributes = await readAllAttributesWithValuesUseCase();
        return {
            items: attributes,
            count: attributes.length,
            total: attributes.length
        };
    } catch (error: any) {
        return {
            items: [],
            count: 0,
            total: 0
        };
    }
}