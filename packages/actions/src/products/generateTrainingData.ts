"use server"

import { ReturnOne } from "@repo/core/types";
import { generateTrainingDataUseCase } from "@repo/core/usecases";

export const generateTrainingDataAction = async () : Promise<ReturnOne<boolean>> => {
    try {        
        const trainingData = await generateTrainingDataUseCase();
        return {
            item: true,
            error: undefined
        }
    } catch (error: any) {
        console.error('Error generating training data:', error);
        return {
            item: false,
            error: error.message
        }
    }
}