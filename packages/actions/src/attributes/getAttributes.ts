"use server"

import { listAttributesUseCase } from "@repo/core/usecases";
import { Attribut } from "@repo/core/models";

export const getAttributesAction = async (): Promise<Attribut[]> => {
    try {
        const attributes = await listAttributesUseCase();
        return attributes;
    } catch (error: any) {
        throw error;
    }
}