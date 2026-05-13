"use server"
import { OpinionFilterInput } from "@repo/core/models";
import { listAllOpinionsUseCase } from "@repo/core/usecases";


export const getListAllOpinionsAction = async (options?: OpinionFilterInput) => {
    try {
        const opinions = await listAllOpinionsUseCase(options);
        return opinions;
    } catch (error: any) {

        return {
            total: 0,
            items: [],
            count: 0,
            error: error.message,
        }

    }
}