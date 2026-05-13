"use server"
import { Opinion } from "@repo/core/models"
import { updateOpinionUseCase } from "@repo/core/usecases";

export const updateOpinion = async (opinion: Opinion): Promise<Opinion> => {
     try {
            const opinions = await updateOpinionUseCase(opinion);
            return opinions;
        } catch (error: any) {
            throw error;
        }

}