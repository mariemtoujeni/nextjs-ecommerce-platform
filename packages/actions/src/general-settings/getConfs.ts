"use server"

import { Settings } from "@repo/core/models";
import { getConfsUseCase } from "@repo/core/usecases"

export const getConfsAction = async (): Promise<Settings> => {
    try {
        const generalConf = await getConfsUseCase();
        return generalConf;
    } catch (error: any) {
        throw error;
    }
}