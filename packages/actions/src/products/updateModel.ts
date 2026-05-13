"use server"
import { ModelUpdate } from "@repo/core/models";
import { updateModel } from "@repo/core/usecases";

export const updateModelAction = async (modelId: number, update: ModelUpdate) => {
    try {
        await updateModel(modelId, update);
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}